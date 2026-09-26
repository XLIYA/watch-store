"use client";

import { createContext, useContext, useTransition, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const NavigationContext = createContext<((href: string) => void) | null>(null);

/** فیلتر و صفحه‌بندی در یک transition مشترک‌اند؛ نتیجهٔ قبلی تا رسیدن پاسخ سرور با وضعیت انتظار حفظ می‌شود. */
export function CollectionNavigation({ children }: { children: ReactNode }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <NavigationContext.Provider value={href => startTransition(() => router.push(href, { scroll: false }))}>
      <div className="relative" aria-busy={pending}>
        {pending && <div role="status" className="sticky top-24 z-20 mb-4 flex items-center justify-center gap-3 rounded-xl border border-forest/20 bg-background/95 p-4 text-sm text-forest shadow-sm backdrop-blur">
          <Loader2 className="size-4 animate-spin" aria-hidden /> در حال دریافت ساعت‌ها…
        </div>}
        <div className={pending ? "opacity-50 transition-opacity" : "transition-opacity"}>{children}</div>
      </div>
    </NavigationContext.Provider>
  );
}

/** href واقعی حفظ می‌شود؛ فقط ناوبری داخل همین تب وارد transition می‌شود، بنابراین بازکردن در تب جدید سالم می‌ماند. */
export function CollectionNavigationLink({ href, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} href={href} onNavigate={event => {
    if (!navigate) return;
    event.preventDefault();
    navigate(href);
  }} />;
}
