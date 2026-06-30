import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rataplam.com.br'),
  title: "RATAPLAM - Roupas Infantis | Qualidade e Conforto ha 60+ anos",
  description: "A Rataplam e uma loja de roupas infantis com mais de 60 anos de historia, localizada em Ipanema, Rio de Janeiro. Macacoes, bermudas, blusas, biquinis e acessorios para criancas de 0 a 14 anos. Frete gratis acima de R$ 199,90.",
  keywords: "roupas infantis, roupas de bebe, macacao infantil, bermuda menino, blusa crianca, biquini infantil, RATAPLAM, moda infantil, roupas criancas",
  openGraph: {
    title: "RATAPLAM - Roupas Infantis",
    description: "Loja de roupas infantis com mais de 60 anos de historia. Qualidade e conforto para o seu pequeno.",
    url: "https://rataplam.com.br",
    siteName: "RATAPLAM",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "https://static.wixstatic.com/media/e23129_6d74875b94694dba867fa650748fdbca~mv2.jpg", width: 1200, height: 630, alt: "RATAPLAM - Roupas Infantis" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RATAPLAM - Roupas Infantis",
    description: "Loja de roupas infantis com mais de 60 anos de historia.",
    images: ["https://static.wixstatic.com/media/e23129_6d74875b94694dba867fa650748fdbca~mv2.jpg"],
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
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#078CFB" />
        <link rel="icon" href="https://static.wixstatic.com/media/e23129_ad8b4533a5764515931ef85b928eebde~mv2.jpg" />
        <link rel="apple-touch-icon" href="https://static.wixstatic.com/media/e23129_ad8b4533a5764515931ef85b928eebde~mv2.jpg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "RATAPLAM",
            description: "Loja de roupas infantis com mais de 60 anos de historia",
            url: "https://rataplam.com.br",
            telephone: "+55-21-972260414",
            address: { "@type": "PostalAddress", streetAddress: "Travessa Roma 14", addressLocality: "Rio de Janeiro", addressRegion: "RJ", postalCode: "22451-510", addressCountry: "BR" },
            image: "https://static.wixstatic.com/media/e23129_6d74875b94694dba867fa650748fdbca~mv2.jpg",
            sameAs: ["https://www.instagram.com/rataplam.loja/"],
            makesOffer: {
              "@type": "OfferCatalog",
              name: "Roupas Infantis",
              itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Macacoes Infantis" } },
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Bermudas Infantis" } },
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Blusas Infantis" } },
                { "@type": "Offer", itemOffered: { "@type": "Product", name: "Biquinis Infantis" } },
              ],
            },
          }),
        }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
