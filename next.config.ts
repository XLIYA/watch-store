import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تصاویر آپلودشده از همان API مجازند؛ wildcard دامنه باز نمی‌شود تا optimizer پراکسی عمومی نشود.
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_API_BASE_URL ? [new URL("/files/**", process.env.NEXT_PUBLIC_API_BASE_URL)] : [],
  },
};

export default nextConfig;
