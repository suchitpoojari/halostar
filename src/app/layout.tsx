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
    "vedic astrology for the way you actually talk. nakshatra, dasha, tithi — none of the aunty whatsapp forward energy. coming soon.",
  metadataBase: new URL("https://halostar.in"),
  openGraph: {
    title: "halostar — vedic astrology in your voice",
    description:
      "vedic astrology for the way you actually talk. coming soon.",
    url: "https://halostar.in",
    siteName: "halostar",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "halostar — vedic astrology in your voice",
    description:
      "vedic astrology for the way you actually talk. coming soon.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
