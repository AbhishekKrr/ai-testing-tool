import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "VedaAI – Assignment Creator",
  description: "AI-powered question paper generator for educators",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
