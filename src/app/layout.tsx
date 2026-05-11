import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "日常记事本",
  description: "记录代码、工具、技能和知识",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full font-sans">{children}</body>
    </html>
  );
}
