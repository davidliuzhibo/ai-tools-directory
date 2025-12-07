import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "AI工具大全 - 发现最好的AI工具",
  description: "汇集全球优秀AI工具，提供分类展示、智能排名、使用案例。帮助你发现和使用最适合的AI工具。",
  keywords: "AI工具,人工智能,ChatGPT,AI画图,AI编程,AI视频",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AntdRegistry>
      </body>
    </html>
  );
}
