import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("compte réel, changement du mot de passe et nouvelle connexion", async ({
  page,
}) => {
  const email = `account-${Date.now()}@example.test`;
  const original = "a-long-account-test-password";
  await page.goto("/register?next=account");
  await page.getByLabel("Votre nom").fill("Compte Test");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(original);
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(page).toHaveURL("/account");
  await page.getByLabel("Mot de passe actuel").fill("incorrect");
  await page
    .getByLabel("Nouveau mot de passe")
    .fill("a-new-long-account-password");
  await page
    .getByRole("button", { name: "Enregistrer le mot de passe" })
    .click();
  await expect(page.getByRole("alert")).toHaveText(
    "Le mot de passe actuel est incorrect.",
  );
  await page.getByLabel("Mot de passe actuel").fill(original);
  await page
    .getByRole("button", { name: "Enregistrer le mot de passe" })
    .click();
  await expect(page).toHaveURL("/login?password=changed");
  await expect(page.getByRole("status")).toContainText(
    "Toutes vos sessions ont été fermées",
  );
  expect((await page.request.get("/api/auth/me")).status()).toBe(401);
  await page.getByLabel("Adresse e-mail").fill(email);
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill("a-new-long-account-password");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page).toHaveURL("/dashboard");
});

test("assistant non configuré, modal clavier et timeline synchronisée", async ({
  page,
}) => {
  await page.goto("/dashboard?mode=demo");
  await expect(page.locator(".timeline-readout")).toContainText("°C");
  await page.getByLabel("Métrique", { exact: true }).selectOption("CAP_PM25");
  await expect(page.locator(".timeline-readout")).toContainText("µg/m³");
  const button = page.getByRole("button", {
    name: "Assistant IA",
    exact: true,
  });
  await button.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("status").filter({ hasText: "n’est pas encore activé" }),
  ).toContainText("n’est pas encore activé");
  await expect(dialog.getByLabel("Votre question")).toBeDisabled();
  await expect(dialog.getByRole("checkbox")).not.toBeChecked();
  await page.keyboard.press("/");
  await expect(page).not.toHaveURL(/view=sensors/);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(button).toBeFocused();
});

test("chatbot, consentement, contexte limité et texte externe sûr (réseau simulé)", async ({
  page,
}) => {
  await page.route("**/api/assistant/config", (route) =>
    route.fulfill({
      json: { enabled: true, provider: "OpenAI", model: "fixture-model" },
    }),
  );
  const requests = [];
  await page.route("**/api/assistant/messages", (route) => {
    const body = route.request().postDataJSON();
    requests.push(body);
    return route.fulfill({
      json: {
        answer: "<img src=x onerror=window.chatInjected=true> Réponse de test",
        model: "fixture-model",
        source: body.share_observations ? "demo" : "no_observations",
        context: body.share_observations
          ? [
              {
                id: "CAP_TEMP",
                name: "Température",
                value: 21,
                unit: "°C",
                time: "2026-10-16T10:00:00Z",
              },
            ]
          : [],
      },
    });
  });
  await page.goto("/dashboard?mode=demo");
  await page.getByRole("button", { name: "Assistant IA", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Votre question").fill("Explique les seuils");
  await dialog.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(dialog.getByText(/Réponse de test/)).toBeVisible();
  expect(requests[0].share_observations).toBe(false);
  expect(requests[0].mode).toBe("demo");
  expect(await page.evaluate(() => window.chatInjected)).toBeUndefined();
  await dialog.getByRole("checkbox").check();
  await dialog.getByLabel("Votre question").fill("Analyse ces mesures");
  await dialog.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(
    dialog.getByText("Observations transmises · démo"),
  ).toBeVisible();
  expect(requests[1].share_observations).toBe(true);
  expect(requests[1].history).toHaveLength(2);
  await dialog.getByRole("checkbox").uncheck();
  await dialog.getByLabel("Votre question").fill("Question générale");
  await dialog.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(
    dialog.getByText("Aucune observation transmise pour cette réponse."),
  ).toHaveCount(2);
  expect(requests[2].history).toHaveLength(2);
});

test("Business: absence de configuration, retour de paiement sans confirmation et erreur (réseau simulé)", async ({
  page,
}) => {
  await page.goto("/business?checkout=returned");
  await expect(
    page.getByRole("status").filter({ hasText: "abonnements" }),
  ).toContainText("pas encore ouverts");
  await expect(page.getByText(/Le retour seul ne confirme/)).toBeVisible();
  await page.route("**/api/billing/plan", (route) =>
    route.fulfill({
      json: {
        enabled: true,
        price: {
          amount: 4900,
          currency: "eur",
          interval: "month",
          interval_count: 1,
          test_mode: true,
        },
      },
    }),
  );
  await page.route("**/api/billing/status", (route) =>
    route.fulfill({
      json: { status: "none", subscribed: false, has_customer: false },
    }),
  );
  await page.route("**/api/billing/checkout", (route) =>
    route.fulfill({
      status: 503,
      json: { detail: "Stripe est indisponible. Réessayez." },
    }),
  );
  await page.reload();
  await expect(page.getByText("49,00 €", { exact: true })).toBeVisible();
  await expect(page.getByText(/Mode test Stripe/)).toBeVisible();
  await page.getByRole("button", { name: "Continuer avec Stripe" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Stripe est indisponible",
  );
  await expect(page).toHaveURL(/business/);
  await expect(
    page.getByText("Aucun abonnement", { exact: true }),
  ).toBeVisible();
});

for (const width of [320, 768, 1440])
  test(`nouvelles interfaces accessibles ${width}px et mouvement réduit`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const registration = await page.request.post("/api/auth/register", {
      headers: { "X-EcoTwin-Request": "1" },
      data: {
        name: "Accessibilité",
        email: `a11y-${width}-${Date.now()}@example.test`,
        password: "long-accessibility-password",
      },
    });
    expect(registration.status()).toBe(201);
    for (const path of ["/business", "/account", "/dashboard?mode=demo"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (path.includes("dashboard")) {
        if (width <= 768) {
          await expect(
            page.getByRole("link", { name: "Business", exact: true }),
          ).toBeVisible();
        }
        await page
          .getByRole("button", { name: "Assistant IA", exact: true })
          .click();
        await expect(page.getByRole("dialog")).toBeVisible();
        const styles = await page.getByRole("dialog").evaluate((el) => ({
          animation: getComputedStyle(el).animationName,
          width: el.getBoundingClientRect().width,
        }));
        expect(styles.animation).toBe("none");
        expect(styles.width).toBeLessThanOrEqual(width);
        await expect(
          page
            .getByRole("dialog")
            .getByRole("status")
            .filter({ hasText: "n’est pas encore activé" }),
        ).toContainText("n’est pas encore activé");
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  });
