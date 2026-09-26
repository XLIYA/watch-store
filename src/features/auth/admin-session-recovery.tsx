"use client";

import { useEffect } from "react";
import { useAdminSession } from "./use-admin-session";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/** همان interceptor فقط در 401 نشست را تمدید می‌کند؛ بارگذاری کامل مقصد مانع استفاده از cache قدیمی مسیر محافظت‌شده است. */
export function AdminSessionRecovery({ destination }: { destination: string }) {
  const session = useAdminSession();
  useEffect(() => {
    if (session.isFetching || !session.isSuccess) return;
    window.location.replace(session.data ? destination : "/admin/login");
  }, [session.isFetching, session.isSuccess, session.data, destination]);
  return <main className="flex min-h-screen items-center justify-center p-6" dir="rtl">
    <div className="max-w-md space-y-5 rounded-3xl border bg-card p-8 text-center">
      <h1 className="text-xl">بررسی ورود به مدیریت</h1>
      {session.isError ? <>
        <p role="alert" className="text-sm leading-7 text-muted-foreground">ارتباط با سرور برقرار نشد. اطلاعات ورود شما حذف نشده است؛ دوباره تلاش کنید.</p>
        <Button onClick={() => session.refetch()} disabled={session.isFetching}>تلاش دوباره</Button>
      </> : <p role="status" className="flex items-center justify-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" /> در حال بررسی نشست…</p>}
    </div>
  </main>;
}
