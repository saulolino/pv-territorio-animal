import { test, expect } from "@playwright/test";

test.describe("Páginas públicas", () => {
  test("homepage carrega com título correto", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Território Animal|Pets/i);
  });

  test("página /privacidade carrega", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page.getByRole("heading", { name: /Política de Privacidade/i })).toBeVisible();
  });

  test("página /termos carrega", async ({ page }) => {
    await page.goto("/termos");
    await expect(page.getByRole("heading", { name: /Termos de Uso/i })).toBeVisible();
  });

  test("página /organizacoes carrega", async ({ page }) => {
    await page.goto("/organizacoes");
    await expect(page.getByRole("heading", { name: /Organizações/i })).toBeVisible();
  });

  test("página /developers carrega", async ({ page }) => {
    await page.goto("/developers");
    await expect(page.getByRole("heading", { name: /API Pública/i })).toBeVisible();
  });

  test("página 404 personalizada", async ({ page }) => {
    await page.goto("/rota-que-nao-existe-xyz");
    await expect(page.locator("body")).toContainText(/não encontrada|404|Página/i);
  });

  test("sitemap.xml acessível", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("xml");
  });

  test("robots.txt acessível", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("User-agent");
  });
});
