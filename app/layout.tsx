import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "کاتالوگ تابلوهای کرمان آتاری",
  description: "گالری تابلوهای کرمان آتاری",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fafaf9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
