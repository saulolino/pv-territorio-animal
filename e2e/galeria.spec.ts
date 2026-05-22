import { test, expect } from "@playwright/test";

test.describe("Galeria pública", () => {
  test("carrega a página de animais", async ({ page }) => {
    await page.goto("/animais");
    await expect(page).toHaveTitle(/Animais|Território Animal/i);
    await expect(page.getByRole("heading", { name: /Animais para adoção/i })).toBeVisible();
  });

  test("filtros de espécie funcionam", async ({ page }) => {
    await page.goto("/animais");
    await page.selectOption("select:near(:text('Todas as espécies'))", "cachorro");
    await page.waitForURL(/especie=cachorro/);
    await expect(page.url()).toContain("especie=cachorro");
  });

  test("link da homepage vai para galeria", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Ver todos|adoção/i }).first().click();
    await expect(page).toHaveURL(/\/animais/);
  });
});
