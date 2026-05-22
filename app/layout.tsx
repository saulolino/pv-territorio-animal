import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pets.lino.app.br";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PV Território Animal — Adoção responsável no DF",
    template: "%s | PV Território Animal",
  },
  description:
    "Adoção responsável de animais no Distrito Federal. Conectamos protetores, abrigos e adotantes comprometidos.",
  keywords: ["adoção de animais", "cachorro para adoção", "gato para adoção", "Brasília", "DF", "Partido Verde"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PV Território Animal",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "PV Território Animal",
    title: "PV Território Animal — Adoção responsável no DF",
    description: "Adoção responsável de animais no DF — uma iniciativa do Partido Verde.",
    url: BASE_URL,
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PV Território Animal",
    description: "Adoção responsável de animais no Distrito Federal.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2d7a1f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PV Animal" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
