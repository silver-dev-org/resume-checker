import { test, expect } from "@playwright/test";

test("click on victor vigon and verify review", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Resume checker/);

  await page.locator('button:has-text("Victor Vigon")').click();

  await page.waitForURL("/review");

  const vigonSpecificTextElement = await page.waitForSelector(
    'text="Este resume fue elaborado en"',
    {
      timeout: 300 * 1000,
    },
  );

  expect(
    page.getByText(
      "El CV sigue todas las recomendaciones de Silver en formato y contenido y va a tener resultados optimos en procesos de entrevista",
    ),
  ).toBeDefined();

  expect(vigonSpecificTextElement).not.toBeNull();
});
