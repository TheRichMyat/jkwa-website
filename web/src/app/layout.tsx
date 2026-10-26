import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Noto_Serif_JP } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// Only used for the 和 kanji, so it isn't preloaded
const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    template: "%s | Atelier JK&WA",
    default: "Atelier JK&WA — Japanese Inspired Interior Design",
  },
  description:
    "Blending traditional values with modern living, we create spaces that bring balance, beauty and a sense of peace to your everyday life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${notoSerifJp.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
