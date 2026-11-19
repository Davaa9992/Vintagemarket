import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { LangProvider } from "@/components/lang-provider";
import { getDict } from "@/lib/lang";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Vintage Mongolia", template: "%s · Vintage Mongolia" },
  description: "Монгол даяарх худалдагчдын винтаж, хуучны эд зүйлсийн зах.",
};

export const viewport: Viewport = { themeColor: "#f4efe6" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang } = await getDict();
  return (
    <html lang={lang} className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-screen">
        <LangProvider lang={lang}>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
