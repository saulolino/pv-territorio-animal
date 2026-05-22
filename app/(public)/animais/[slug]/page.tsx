import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AnimalView from "./AnimalView";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pets.lino.app.br";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const animal = await prisma.animal.findUnique({
      where: { slug: params.slug },
      include: { fotos: { where: { principal: true }, take: 1 }, ra: { select: { nome: true } } },
    });

    if (!animal) return { title: "Animal não encontrado" };

    const foto = animal.fotos[0]?.url;
    const raText = animal.ra ? ` — ${animal.ra.nome}` : "";
    const especieCapitalized = animal.especie.charAt(0).toUpperCase() + animal.especie.slice(1);
    const title = `${animal.nome} — ${especieCapitalized} para adoção${raText}`;
    const description = animal.descricao.slice(0, 155) + (animal.descricao.length > 155 ? "..." : "");
    const url = `${BASE_URL}/animais/${params.slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: "website",
        images: foto ? [{ url: foto, width: 1200, height: 900, alt: animal.nome }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: foto ? [foto] : [],
      },
      alternates: { canonical: url },
    };
  } catch {
    return { title: "Animal | PV Território Animal" };
  }
}

export default function AnimalPage() {
  return <AnimalView />;
}
