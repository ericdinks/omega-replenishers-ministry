import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { pastorConfig, siteConfig, socialLinks } from "@/lib/config/site";
import { getSiteContent } from "@/lib/content/site-content";

const SITE_URL = "https://www.omegareplenishers.com";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.shortName,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: pastorConfig.heroPhotoSrc, width: 800, height: 1000 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [pastorConfig.heroPhotoSrc],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ReligiousOrganization",
  name: siteConfig.name,
  url: SITE_URL,
  logo: `${SITE_URL}${pastorConfig.photoSrc}`,
  founder: {
    "@type": "Person",
    name: pastorConfig.name,
  },
  sameAs: [socialLinks.youtube, socialLinks.facebook, socialLinks.tiktok].filter(Boolean),
};

export const viewport: Viewport = {
  themeColor: "#0B1325",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ServiceWorkerRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer phone={content.contact_phone} email={content.contact_email} />
      </body>
    </html>
  );
}
