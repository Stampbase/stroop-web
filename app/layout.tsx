import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono } from "next/font/google";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-archivo",
  display: "swap",
});

/** Used only for the markings engraved on the card. */
const engraved = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-engraved",
  display: "swap",
});

const title = "Stroop.ID — Claim your identity on Stellar";
const description =
  "Reserve your Stroop ID: one name for every Stellar app, wallet, and payment.";

export const metadata: Metadata = {
  metadataBase: new URL("https://stroop.id"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://stroop.id",
    siteName: "Stroop.ID",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${engraved.variable}`}>
      <body>{children}</body>
    </html>
  );
}
