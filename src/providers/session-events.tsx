"use client";

/**
 * یک بار داخل QueryProvider نصب می‌شود تا خروج از هر صفحه یا tab، دادهٔ خصوصی cache را پاک کند.
 * ارتباط با Axios از طریق event است؛ بنابراین سرویس شبکه به React و hook وابسته نمی‌شود.
 * cleanup از چندبار اجراشدن listener هنگام جابه‌جایی یا بازنصب provider جلوگیری می‌کند.
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sessionQueryKey } from "@/features/auth/use-admin-session";
import {
  invalidateSession,
  SESSION_CHANNEL,
  SESSION_ENDED_EVENT,
} from "@/services/api/api-client";
import { removeLegacyTokens } from "@/services/auth.service";

export function SessionEvents() {
  const client = useQueryClient();
  useEffect(() => {
    removeLegacyTokens();
    const clearPrivateData = () => {
      // cart عمومی باقی می‌ماند؛ درخواست دیررس ادمین اجازهٔ پرکردن دوبارهٔ cache را ندارد.
      void client.cancelQueries({ queryKey: ["admin"] });
      client.removeQueries({ queryKey: ["admin"] });
      client.setQueryData(sessionQueryKey, null);
    };
    window.addEventListener(SESSION_ENDED_EVENT, clearPrivateData);
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(SESSION_CHANNEL)
        : null;
    if (channel)
      channel.onmessage = (event) => {
        if (event.data === "logout") invalidateSession();
      };
    return () => {
      window.removeEventListener(SESSION_ENDED_EVENT, clearPrivateData);
      channel?.close();
    };
  }, [client]);
  return null;
}
