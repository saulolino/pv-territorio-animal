import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pets.lino.app.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/animais", "/animais/"],
        disallow: ["/api/", "/painel/", "/admin/", "/perfil/", "/painel/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
