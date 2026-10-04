import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { getTryOnAssets } from "@/features/catalog/try-on-assets";
import { Button } from "@/components/ui/button";

/** ورودی پرو فقط بعد از وجود عکس دست و حداقل یک محصول آماده در ویترین ظاهر می‌شود. */
export async function TryOnTeaser() {
  const assets = await getTryOnAssets();
  if (!assets?.items.length) return null;
  return (
    <section className="site-container pb-12">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-forest p-8 text-ivory">
        <div>
          <p className="mb-3 text-xs text-gold-light">نگاهی پیش از انتخاب</p>
          <h2 className="text-2xl leading-relaxed">
            ساعت بعدی را روی مچ ببینید.
          </h2>
          <p className="mt-3 text-sm text-ivory/70">
            مدل‌های آماده را ورق بزنید و ظاهرشان را روی یک مچ نمونه مقایسه کنید.
          </p>
        </div>
        <Button asChild variant="secondary" className="h-12 px-6">
          <Link href="/try-on">
            پرو ساعت روی مچ
            <ArrowUpLeft />
          </Link>
        </Button>
      </div>
    </section>
  );
}
