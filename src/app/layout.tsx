import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kobinerji - Görev Takip Sistemi",
  description: "Kobinerji ekibi için profesyonel görev takip ve yönetim platformu",
  keywords: ["görev takip", "proje yönetimi", "kobinerji", "task management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Kobinerji Görev Takip Sistemi - Ekibinizi verimli yönetin" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
