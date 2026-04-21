import type { Metadata } from "next";
import { fontSans, fontHeading, fontMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynthApp",
  description: "Build full-stack apps with AI. Describe your idea, refine it with chat, and deploy instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
