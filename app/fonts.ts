import { Figtree, Geist_Mono, Orbitron } from "next/font/google";

export const fontSans = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Use Orbitron for headings for a subtle futuristic feel
export const fontHeading = Orbitron({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});
