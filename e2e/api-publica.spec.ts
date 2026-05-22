import { test, expect } from "@playwright/test";

test.describe("API pública", () => {
  test("GET /api/public/stats retorna campos esperados", async ({ request }) => {
    const res = await request.get("/api/public/stats");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("disponiveis");
    expect(data).toHaveProperty("adotados");
    expect(data).toHaveProperty("protetores");
    expect(data).toHaveProperty("ras");
  });

  test("GET /api/public/ras retorna 35 RAs", async ({ request }) => {
    const res = await request.get("/api/public/ras");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(35);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("GET /api/public/animais retorna estrutura paginada", async ({ request }) => {
    const res = await request.get("/api/public/animais?limit=5");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("page");
    expect(data).toHaveProperty("pages");
    expect(data.data.length).toBeLessThanOrEqual(5);
  });

  test("GET /api/public/animais com filtro de espécie", async ({ request }) => {
    const res = await request.get("/api/public/animais?especie=cachorro");
    expect(res.status()).toBe(200);
    const data = await res.json();
    for (const animal of data.data) {
      expect(animal.especie).toBe("cachorro");
    }
  });

  test("CORS header presente na API pública", async ({ request }) => {
    const res = await request.get("/api/public/stats");
    expect(res.headers()["access-control-allow-origin"]).toBe("*");
  });
});
