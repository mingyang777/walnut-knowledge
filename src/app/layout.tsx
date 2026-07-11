import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "文玩核桃知识库",
  description: "全网最全文玩核桃品种知识库，支持分类检索与 AI 识图鉴别",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSans.variable} ${notoSerif.variable} font-sans`}>
        <Header />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-walnut-200 bg-walnut-100/50 py-8 text-center text-sm text-walnut-600">
          <p>文玩核桃知识库 · 传承文化 · 科学鉴别</p>
        </footer>
      </body>
    </html>
  );
}
