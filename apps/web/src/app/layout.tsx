import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarsCanada - Buy and Sell Cars in Canada",
  description: "Your trusted marketplace for buying and selling cars across Canada. Find your perfect vehicle from thousands of listings.",
  keywords: "cars, canada, buy cars, sell cars, used cars, new cars, dealerships, automotive marketplace",
  authors: [{ name: "CarsCanada" }],
  creator: "CarsCanada",
  publisher: "CarsCanada",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://carscanada.ca",
    siteName: "CarsCanada",
    title: "CarsCanada - Buy and Sell Cars in Canada",
    description: "Your trusted marketplace for buying and selling cars across Canada",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CarsCanada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CarsCanada - Buy and Sell Cars in Canada",
    description: "Your trusted marketplace for buying and selling cars across Canada",
    images: ["/og-image.png"],
    creator: "@carscanada",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
