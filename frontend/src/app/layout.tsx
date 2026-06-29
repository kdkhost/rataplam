import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rataplam.com.br'),
  title: "RATAPLAM - Roupas Infantis | Qualidade e Conforto",
  description: "Loja de roupas infantis RATAPLAM. Macacoes, bermudas, blusas, biquinis e acessorios para criancas de 0 a 14 anos. Frete gratis acima de R$ 199,90.",
  keywords: "roupas infantis, roupas de bebe, macacao infantil, bermuda menino, blusa crianca, biquini infantil, RATAPLAM",
  openGraph: {
    title: "RATAPLAM - Roupas Infantis",
    description: "Loja de roupas infantis RATAPLAM. Qualidade e conforto para o seu pequeno.",
    url: "https://rataplam.com.br",
    siteName: "RATAPLAM",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "RATAPLAM - Roupas Infantis" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RATAPLAM - Roupas Infantis",
    description: "Loja de roupas infantis RATAPLAM. Qualidade e conforto para o seu pequeno.",
    images: ["/images/og-default.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  alternates: { canonical: "https://rataplam.com.br" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "RATAPLAM",
            description: "Loja de roupas infantis RATAPLAM",
            url: "https://rataplam.com.br",
            address: { "@type": "PostalAddress", addressLocality: "Sao Paulo", addressRegion: "SP", addressCountry: "BR" },
            makesOffer: {
              "@type": "OfferCatalog",
              name: "Roupas Infantis",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Macacoes Infantis" } },
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Bermudas Infantis" } },
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Blusas Infantis" } },
              ],
            },
          }),
        }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
