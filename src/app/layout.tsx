import type { Metadata } from "next";

import {
  Cormorant_Garamond,
  Geist_Mono,
} from "next/font/google";

import { StoreProvider } from "@/store/store-provider";

import "@fontsource-variable/estedad/wght.css";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

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
      <body
        className={`${cormorant.variable} ${geistMono.variable}`}
      >
        <StoreProvider>
          {children}
        </StoreProvider>

        <Toaster
          position="top-center"
          richColors
        />
      </body>
    </html>
  );
}