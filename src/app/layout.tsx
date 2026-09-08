import type { Metadata } from "next";

import { StoreProvider } from "@/store/store-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Watch Store",
  description: "Luxury Watch Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}