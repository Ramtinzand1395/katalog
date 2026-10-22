import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "گالری آثار | مجموعه‌ی منتخب",
  description: "آرشیو تصویری و مجموعه‌ی منتخب آثار",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#090909",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
