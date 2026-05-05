import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "halostar — vedic astrology in your voice",
  description:
    "real vedic astrology — nakshatra, dasha, gochar — in the way you actually talk. mumbai gen z, no aunty whatsapp forwards.",
  metadataBase: new URL("https://halostar.in"),
  openGraph: {
    title: "halostar — vedic astrology in your voice",
    description: "real vedic astrology in the way you actually talk.",
    url: "https://halostar.in",
    siteName: "halostar",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "halostar — vedic astrology in your voice",
    description: "real vedic astrology in the way you actually talk.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
