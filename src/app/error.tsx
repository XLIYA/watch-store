"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // خطای سرور/شبکه نباید به صفحهٔ محصول ناموجود تبدیل شود یا جزئیات فنی را نمایش دهد.
  return <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 p-8 text-center" role="alert">
    <h1 className="text-2xl">دریافت اطلاعات انجام نشد</h1>
    <p className="text-muted-foreground">ارتباط با سرور را بررسی کنید و دوباره تلاش کنید.</p>
    <Button onClick={reset}>تلاش دوباره</Button>
  </main>;
}
