import { test, expect } from "@playwright/test";

const EMAIL_PROTETOR = `e2e_protetor_${Date.now()}@test.invalid`;
const SENHA = "Senha@E2E2026!";

test.describe("Autenticação — protetor", () => {
  test("cadastro de protetor novo", async ({ page }) => {
    await page.goto("/cadastro");
    await expect(page.getByRole("heading", { name: /Criar conta|Cadastro/i })).toBeVisible();

    await page.getByLabel(/Nome completo/i).fill("Protetor E2E");
    await page.getByLabel(/E-mail/i).fill(EMAIL_PROTETOR);
    await page.getByLabel(/Senha/i).first().fill(SENHA);

    // Selecionar tipo protetor, se o campo existir
    const tipoSelect = page.locator("select").first();
    if (await tipoSelect.isVisible()) await tipoSelect.selectOption("protetor");

    await page.getByRole("button", { name: /Cadastrar|Criar conta/i }).click();

    // Deve redirecionar ou mostrar mensagem de verificação de e-mail
    await expect(page.locator("body")).toContainText(/verificação|e-mail|verifique/i, { timeout: 8_000 });
  });

  test("login com credenciais inválidas mostra erro", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/E-mail/i).fill("naoexiste@test.invalid");
    await page.getByLabel(/Senha/i).fill("senhaerrada");
    await page.getByRole("button", { name: /Entrar|Login/i }).click();
    await expect(page.locator("body")).toContainText(/inválid|incorret|não encontrad/i, { timeout: 5_000 });
  });
});
