import { brand } from "@/config/brand";
import type { Metadata } from "next";

import { Cormorant_Garamond, Geist_Mono } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import { StoreProvider } from "@/store/store-provider";

import "@fontsource-variable/estedad/wght.css";
import "./globals.css";

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
  title: { default: brand.title, template: `%s | ${brand.title}` },
  icons: { icon: brand.mark, apple: brand.mark },
  description: brand.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${cormorant.variable} ${geistMono.variable}`}>
        {/*
         * هدف:
         * فراهم‌کردن Providerهای اصلی پروژه برای تمام صفحات.
         *
         * محل استفاده:
         * RootLayout کل Application.
         *
         * نحوه کار:
         * StoreProvider مسئول Redux و Client State مثل Cart است.
         * QueryProvider مسئول Server State، Cache و درخواست‌های API است.
         * TooltipProvider نیز Context مربوط به Tooltipهای shadcn را فراهم می‌کند.
         */}
        <StoreProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </StoreProvider>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
