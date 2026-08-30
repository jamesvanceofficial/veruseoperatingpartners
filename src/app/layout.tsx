import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  // Stage 18 — required so Open Graph/Twitter image URLs resolve to the
  // real domain instead of localhost (Next warns and falls back to
  // localhost without this, which would break every social-share preview
  // in production).
  metadataBase: new URL("https://verusoperatingpartners.com"),
  title: "VERUS Operating Company",
  description: "COMPASS — the internal operating system for VERUS Operating Company.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
