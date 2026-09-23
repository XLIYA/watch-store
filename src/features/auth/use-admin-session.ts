"use client";

/**
 * layout مدیریت از این hook برای تشخیص ورود، انتظار و خطای ارتباط استفاده می‌کند.
 * تنها 401 و 403 به نبود نشست تبدیل می‌شوند؛ قطع شبکه نباید کاربر را به صفحهٔ ورود بفرستد.
 * React Query وضعیت سرور را نگه می‌دارد تا state موازی و ناسازگار در صفحات ایجاد نشود.
 */

import { useQuery } from "@tanstack/react-query";
import { getAdminSession } from "@/services/auth.service";
import { getErrorStatus } from "@/services/api/api-error";

export const sessionQueryKey = ["auth", "session"] as const;

export function useAdminSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async ({ signal }) => {
      try {
        return await getAdminSession(signal);
      } catch (error) {
        if ([401, 403].includes(getErrorStatus(error) ?? 0)) return null;
        throw error;
      }
    },
    // اعتبار session از سرور می‌آید؛ دادهٔ cache مجوز ورود دوباره به پنل نیست.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });
}
