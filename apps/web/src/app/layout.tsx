import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarsCanada - Buy and Sell Cars in Canada",
  description: "Your trusted marketplace for buying and selling cars across Canada.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}