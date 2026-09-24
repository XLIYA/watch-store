import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تصاویر آپلودشده از همان API مجازند؛ wildcard دامنه باز نمی‌شود تا optimizer پراکسی عمومی نشود.
  images: {
    // سرور آموزشی روی loopback اجرا می‌شود؛ مجوز IP داخلی فقط برای همین میزبان تنظیم‌شده فعال است.
    dangerouslyAllowLocalIP:
      !!process.env.NEXT_PUBLIC_API_BASE_URL &&
      ["localhost", "127.0.0.1", "[::1]"].includes(
        new URL(process.env.NEXT_PUBLIC_API_BASE_URL).hostname,
      ),
    remotePatterns: process.env.NEXT_PUBLIC_API_BASE_URL
      ? [new URL("/files/**", process.env.NEXT_PUBLIC_API_BASE_URL)]
      : [],
  },
};

export default nextConfig;
