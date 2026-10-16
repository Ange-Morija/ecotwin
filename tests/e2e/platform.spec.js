import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("présentation, démo, filtres partageables et export", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Votre bâtiment.",
  );
  await page
    .getByRole("link", { name: "Explorer le jumeau numérique" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Vue d’ensemble", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Vous explorez un site de démonstration."),
  ).toBeVisible();
  await page.getByLabel("Métrique", { exact: true }).selectOption("CAP_PM25");
  await expect(page).toHaveURL(/metric=CAP_PM25/);
  await page.getByLabel("Période", { exact: true }).selectOption("7d");
  await expect(page).toHaveURL(/period=7d/);
  await expect(
    page.getByRole("img", { name: /168 observations/ }),
  ).toBeVisible();
  await page.getByText("Consulter les valeurs du graphique").click();
  const updated = page.waitForResponse((response) =>
    response.url().includes("/api/dashboard?"),
  );
  await page.getByRole("button", { name: "Actualiser les données" }).click();
  await updated;
  await expect(page.locator(".chart-table")).toHaveAttribute("open", "");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exporter les observations" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "ecotwin-CAP_PM25-7d.csv",
  );
  await page.reload();
  await expect(page.getByLabel("Métrique", { exact: true })).toHaveValue(
    "CAP_PM25",
  );
  await page.getByRole("link", { name: "Capteurs & données" }).click();
  await page.getByRole("searchbox").fill("inexistant");
  await expect(
    page.getByText("Aucune métrique ne correspond.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Effacer la recherche" }).click();
  await expect(page.getByText("8 métriques sur 8")).toBeVisible();
  await page.getByRole("link", { name: "Insights", exact: true }).click();
  await expect(
    page.getByText("Analyse par seuils · IA non connectée.", { exact: false }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("connexion réelle, validation, session persistante et révocation", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByLabel("Adresse e-mail")).toBeFocused();
  await expect(page.getByLabel("Adresse e-mail")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page
    .getByLabel("Adresse e-mail")
    .fill("personne-inconnue@example.test");
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill("incorrect-password");
  await page.getByRole("button", { name: "Afficher le mot de passe" }).click();
  await expect(
    page.getByLabel("Mot de passe", { exact: true }),
  ).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "E-mail ou mot de passe incorrect.",
  );
  await page.getByRole("link", { name: "Créer un compte pilote" }).click();
  await page.getByLabel("Votre nom").fill("Camille Test");
  await page
    .getByLabel("Adresse e-mail")
    .fill(`camille-${Date.now()}@example.test`);
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill("a-unique-test-password-42");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Camille Test", { exact: true })).toBeVisible();
  await expect(
    page.getByText("La source ne répond pas.", { exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await page.reload();
  await expect(page.getByText("Camille Test", { exact: true })).toBeVisible();
  const cookies = await page.context().cookies();
  expect(
    cookies.find((cookie) => cookie.name === "ecotwin_session").httpOnly,
  ).toBe(true);
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL("/login");
  expect((await page.request.get("/api/auth/me")).status()).toBe(401);
});

test("panne réseau conserve les mesures avec un état périmé puis réessai", async ({
  page,
}) => {
  await page.goto("/dashboard?mode=demo");
  await expect(page.locator(".chart-value strong")).toHaveText("24,2");
  await page.route("**/api/dashboard?*", (route) => route.abort());
  await page.getByRole("button", { name: "Actualiser les données" }).click();
  await expect(
    page.getByText("Les observations ne sont plus à jour."),
  ).toBeVisible();
  await expect(page.locator(".chart-value strong")).toHaveText("24,2");
  await page.unroute("**/api/dashboard?*");
  await page.getByRole("button", { name: "Réessayer", exact: true }).click();
  await expect(page.locator(".error-banner")).toHaveCount(0);
});

test("le vrai modèle BIM se charge localement sans dépendance CDN", async ({
  page,
}) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto("/dashboard?mode=demo&view=bim");
  await expect(
    page.getByRole("button", { name: "Charger le modèle 3D" }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.originalCanvas = document.querySelector("#twin-canvas");
  });
  const updated = page.waitForResponse((response) =>
    response.url().includes("/api/dashboard?"),
  );
  await page.getByRole("button", { name: "Actualiser les données" }).click();
  await updated;
  expect(
    await page
      .locator("#twin-canvas")
      .evaluate((canvas) => canvas === window.originalCanvas),
  ).toBe(true);
  await page.getByRole("button", { name: "Charger le modèle 3D" }).click();
  await expect(page.locator(".twin-viewport")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 45000 },
  );
  await expect(page.getByText("Modèle BIM chargé · XKT")).toBeVisible();
  await page.getByRole("button", { name: "Tourner à gauche" }).click();
  await page.getByRole("button", { name: "Zoomer", exact: true }).click();
  await page.getByRole("button", { name: "Ajuster la vue" }).click();
  expect(failures).toEqual([]);
});

for (const width of [390, 1440]) {
  test(`accessibilité et responsive ${width}px sur les pages principales`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    for (const [name, path] of [
      ["produit", "/"],
      ["connexion", "/login"],
      ["dashboard", "/dashboard?mode=demo"],
      ["capteurs", "/dashboard?mode=demo&view=sensors"],
    ]) {
      await page.goto(path);
      if (path.includes("dashboard"))
        await expect(
          page.locator(".summary-grid:visible,.sensors-panel:visible"),
        ).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
      await page.screenshot({
        path: `test-results/${name}-${width}.png`,
        fullPage: true,
      });
    }
  });
}

test("clavier, sélection native et absence de données sans perte des filtres", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.goto("/dashboard?mode=demo");
  const metric = page.getByLabel("Métrique", { exact: true });
  await metric.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(metric).toHaveValue("CAP_HUM");
  await expect(metric).toBeFocused();
  await page.getByLabel("Période", { exact: true }).click();
  await page.keyboard.press("Escape");
  await page.route("**/api/dashboard?*", (route) => route.abort());
  await page.getByLabel("Période", { exact: true }).selectOption("7d");
  await expect(
    page.getByText("Les observations ne sont plus à jour."),
  ).toBeVisible();
  await expect(page.getByLabel("Période", { exact: true })).toHaveValue("24h");
  await expect(page).toHaveURL(/period=24h/);
});

test("ancien viewer : actions persistantes et texte externe sans injection HTML", async ({
  page,
}) => {
  const identity = {
    name: "Legacy Test",
    email: `legacy-${Date.now()}@example.test`,
    password: "unique-legacy-test-password",
  };
  expect(
    (
      await page.request.post("/api/auth/register", {
        headers: { "X-EcoTwin-Request": "1" },
        data: identity,
      })
    ).status(),
  ).toBe(201);
  const action = await page.request.post("/api/mlops/actions", {
    headers: { "X-EcoTwin-Request": "1" },
    data: {
      text: "Contrôle de ventilation",
      done_by: '<img src=x onerror="window.injected=true">',
    },
  });
  expect(action.status()).toBe(201);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/public/index.html");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await expect(page.locator(".action-card")).toHaveCount(1);
  expect(await page.locator(".action-card").textContent()).toContain(
    '<img src=x onerror="window.injected=true">',
  );
  expect(await page.locator(".action-card img").count()).toBe(0);
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
  await page.reload();
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await expect(page.locator(".action-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Nouvelle action", exact: true })
    .click();
  const editor = page.locator("#action-modal");
  await expect(editor).toBeVisible();
  await expect(page.locator("#action-created")).toBeFocused();
  await page.locator("#action-text").fill("Action depuis interface");
  await page.getByRole("button", { name: "Sauvegarder", exact: true }).click();
  await expect(editor).toBeHidden();
  await expect(page.locator(".action-card")).toHaveCount(2);
  const added = page
    .locator(".action-card")
    .filter({ hasText: "Action depuis interface" });
  await added.getByTitle("Supprimer", { exact: true }).click();
  const confirmation = page.getByRole("dialog", { name: "Supprimer l’action" });
  await expect(confirmation).toBeVisible();
  await expect(
    confirmation.getByRole("button", { name: "Annuler" }),
  ).toBeFocused();
  await confirmation.getByRole("button", { name: "Annuler" }).click();
  await expect(page.locator(".action-card")).toHaveCount(2);
  await added.getByTitle("Supprimer", { exact: true }).click();
  await confirmation
    .getByRole("button", { name: "Supprimer", exact: true })
    .click();
  await expect(page.locator(".action-card")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("outils BIM : filtres locaux, lectures mutualisées et cache invalidé après sauvegarde", async ({
  page,
}) => {
  let latest = 0,
    maintenance = 0,
    actions = 0,
    saved = 0;
  let notes = "";
  await page.route("**/api/telemetry/latest?*", (route) => {
    latest++;
    return route.fulfill({
      json: { temperature: 21, humidity: 45, _time: new Date().toISOString() },
    });
  });
  await page.route("**/api/telemetry/maintenance?*", async (route) => {
    if (route.request().method() === "POST") {
      notes = route.request().postDataJSON().maintenance.notes;
      saved++;
      return route.fulfill({
        json: { maintenance: { notes, interval_days: 30 } },
      });
    }
    maintenance++;
    return route.fulfill({
      json: { maintenance: { notes, interval_days: 30 } },
    });
  });
  await page.route("**/api/mlops/actions", (route) => {
    actions++;
    return route.fulfill({ json: [] });
  });
  await page.goto("/public/index.html");
  await expect(page.locator(".sensor-card")).toHaveCount(8);
  expect(latest).toBe(8);
  expect(maintenance).toBe(8);
  expect(actions).toBe(0);
  await page.locator("#sensor-filter").fill("Température");
  await expect(page.locator(".sensor-card")).toHaveCount(1);
  await page
    .locator(".sensor-filter-row")
    .getByRole("button", { name: "Effacer la recherche" })
    .click();
  await expect(page.locator(".sensor-card")).toHaveCount(8);
  await expect(
    page
      .locator(".sensor-card")
      .filter({ hasText: "CAP_PM25" })
      .locator(".sensor-value"),
  ).toHaveText("—");
  expect(latest).toBe(8);
  expect(maintenance).toBe(8);
  await page
    .locator(".sensor-card")
    .first()
    .getByTitle("Éditer maintenance", { exact: true })
    .click();
  await page.locator("#maint-notes").fill("Contrôle du filtre");
  await page.locator("#maint-save").click();
  await expect(page.locator("#maint-modal")).toBeHidden();
  await expect(page.locator(".sensor-card").first()).toContainText(
    "Contrôle du filtre",
  );
  expect(saved).toBe(1);
  expect(latest).toBe(16);
  expect(maintenance).toBe(16);
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await expect(page.locator("#actions-list")).toContainText("Aucune action.");
  await page.locator("#action-filter").fill("filtre local");
  await expect(page.locator("#actions-list")).toContainText("Aucune action.");
  expect(actions).toBe(1);
});

test("catalogue : tri accessible, recherche et export des lignes affichées", async ({
  page,
}) => {
  await page.goto("/dashboard?mode=demo&view=sensors");
  const table = page.getByRole("table");
  const metric = page.getByRole("button", { name: /Trier par Métrique/ });
  await expect(table.locator("tbody tr")).toHaveCount(8);
  const names = () =>
    table.locator("tbody tr td:first-child strong").allTextContents();
  const ascending = await names();
  expect(ascending).toEqual(
    [...ascending].sort((a, b) => a.localeCompare(b, "fr", { numeric: true })),
  );
  await metric.click();
  await expect(
    page.getByRole("columnheader", { name: /Métrique/ }),
  ).toHaveAttribute("aria-sort", "descending");
  await expect(table.locator("tbody tr td:first-child strong")).toHaveText(
    [...ascending].reverse(),
  );
  await page.getByRole("searchbox").fill("CAP_TEMP");
  await expect(table.locator("tbody tr")).toHaveCount(1);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exporter le catalogue" }).click();
  const file = await download;
  const stream = await file.createReadStream();
  let csv = "";
  for await (const chunk of stream) csv += chunk.toString();
  expect(csv).toContain("CAP_TEMP");
  expect(csv).not.toContain("CAP_PM25");
  await page.getByRole("button", { name: "Effacer la recherche" }).click();
  await expect(table.locator("tbody tr td:first-child strong")).toHaveText(
    [...ascending].reverse(),
  );
  await page.getByRole("button", { name: /Trier par Acquisition/ }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("columnheader", { name: /Acquisition/ }),
  ).toHaveAttribute("aria-sort", "ascending");
});

test("petits écrans, textes longs et réduction des animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/dashboard?*", async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    payload.sensors[0].name =
      "Température du local technique et des équipements de ventilation du bâtiment principal";
    await route.fulfill({ response, json: payload });
  });
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of [
      "/",
      "/register",
      "/dashboard?mode=demo&view=sensors",
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (route.includes("dashboard")) {
        await expect(page.getByText("8 métriques sur 8")).toBeVisible();
        await expect(
          page.getByRole("cell", { name: /Température du local technique/ }),
        ).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await page
          .locator("html")
          .evaluate((el) => getComputedStyle(el).scrollBehavior),
      ).toBe("auto");
    }
  }
});

test("React : navigation sans rechargement, scène conservée et filtres restaurés", async ({
  page,
}) => {
  const documents = [];
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame())
      documents.push(request.url());
  });
  await page.goto("/dashboard?mode=demo");
  await expect(page.locator(".summary-grid")).toBeVisible();
  await expect(page.locator(".integration-panel")).toBeHidden();
  await page.evaluate(() => {
    window.reactCanvas = document.querySelector("#twin-canvas");
  });
  await page.getByRole("link", { name: "Capteurs & données" }).click();
  await expect(page.locator(".primary-grid")).toBeHidden();
  await page.getByLabel("État des métriques").selectOption("warning");
  await expect(page.getByText("1 métrique sur 8")).toBeVisible();
  await expect(page).toHaveURL(/state=warning/);
  await page.getByRole("button", { name: /Trier par Métrique/ }).click();
  await expect(page).toHaveURL(/dir=desc/);
  await page.getByRole("link", { name: "Jumeau BIM", exact: true }).click();
  await expect(page.locator(".sensors-panel")).toBeHidden();
  expect(
    await page
      .locator("#twin-canvas")
      .evaluate((canvas) => canvas === window.reactCanvas),
  ).toBe(true);
  await page.goBack();
  await expect(page.getByLabel("État des métriques")).toHaveValue("warning");
  await expect(
    page.getByRole("columnheader", { name: /Métrique/ }),
  ).toHaveAttribute("aria-sort", "descending");
  await page.reload();
  await expect(page.getByLabel("État des métriques")).toHaveValue("warning");
  expect(documents).toHaveLength(2);
});

test("React : graphique au clavier, images chargées et état vide honnête", async ({
  page,
}) => {
  await page.goto("/");
  const drawing = page.locator(".hero-visual .building-drawing");
  await expect(drawing).toBeVisible();
  await expect
    .poll(() => drawing.evaluate((image) => image.naturalWidth))
    .toBeGreaterThan(0);
  await page
    .getByRole("link", { name: "Explorer le jumeau numérique" })
    .click();
  const slider = page.getByRole("slider", { name: "Observation sélectionnée" });
  await slider.focus();
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("1");
  const selected = await page
    .locator(".observation-picker output")
    .textContent();
  await page.getByRole("button", { name: "Actualiser les données" }).click();
  await expect(page.locator(".observation-picker output")).toHaveText(selected);
  await page.route("**/api/dashboard?*", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.sensors = data.sensors.map((sensor) => ({
      ...sensor,
      value: null,
      time: null,
      status: "missing",
    }));
    data.history = Object.fromEntries(
      data.sensors.map((sensor) => [sensor.id, []]),
    );
    data.insights = [];
    await route.fulfill({ response, json: data });
  });
  await page.getByRole("button", { name: "Actualiser les données" }).click();
  await expect(
    page.getByRole("heading", { name: "Aucune observation sur cette période" }),
  ).toBeVisible();
  await expect(page.locator(".chart-value strong")).toHaveText("—");
  await expect(
    page.getByRole("heading", { name: "Aucun dépassement observé" }),
  ).toBeVisible();
});

test("React : panne du SDK BIM puis nouvelle tentative sans recharger la page", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/vendor/xeokit-sdk.es.js*", (route) => route.abort());
  await page.goto("/dashboard?mode=demo&view=bim");
  await page.getByRole("button", { name: "Charger le modèle 3D" }).click();
  await expect(
    page.getByText("La vue 3D nécessite WebGL.", { exact: false }),
  ).toBeVisible();
  await page.unroute("**/vendor/xeokit-sdk.es.js*");
  await page.getByRole("button", { name: "Réessayer le modèle 3D" }).click();
  await expect(page.locator(".twin-viewport")).toHaveAttribute(
    "data-ready",
    "true",
    { timeout: 45000 },
  );
  await page.getByRole("link", { name: "EcoTwin, accueil" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Votre bâtiment.",
  );
  expect(errors).toEqual([]);
});
