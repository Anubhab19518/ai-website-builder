import type { Metadata } from "next";
import "./globals.css";
import { fontSans, fontHeading, fontMono } from "./fonts";

export const metadata: Metadata = {
  title: "SynthApp — AI App Builder",
  description:
    "Build full-stack apps with AI. Describe your idea, refine it with chat, and deploy instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${fontSans.variable} ${fontHeading.variable} ${fontMono.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
