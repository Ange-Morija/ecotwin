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
          page.locator(".summary-grid,.sensors-panel"),
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
  await expect(page.locator(".action-card")).toHaveCount(1);
  expect(await page.locator(".action-card").textContent()).toContain(
    '<img src=x onerror="window.injected=true">',
  );
  expect(await page.locator(".action-card img").count()).toBe(0);
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
  await page.reload();
  await expect(page.locator(".action-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Actions IA", exact: true }).click();
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
