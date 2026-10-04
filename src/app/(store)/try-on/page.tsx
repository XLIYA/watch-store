import Link from "next/link";
import { Watch } from "lucide-react";
import { getTryOnAssets } from "@/features/catalog/try-on-assets";
import { WristPreview } from "@/components/product/wrist-preview";
import { Button } from "@/components/ui/button";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export default async function TryOnPage() {
  const assets = await getTryOnAssets();
  return (
    <main className="content-container experience-page">
      <header className="experience-heading">
        <p className="section-kicker">نگاهی پیش از انتخاب</p>
        <h1 className="section-title">ساعت‌ها را روی مچ ورق بزنید</h1>
      </header>
      {assets?.items.length ? (
        <WristPreview {...assets} />
      ) : (
        <div className="experience-empty">
          <Watch />
          <h2 className="text-lg">تصاویر پرو ساعت در حال آماده‌سازی هستند</h2>
          <p className="text-sm text-muted-foreground">
            تا آماده‌شدن این تجربه، مدل‌ها را در کاتالوگ ببینید یا کنار هم
            مقایسه کنید.
          </p>
          <Button asChild>
            <Link href="/shop">مشاهدهٔ ساعت‌ها</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
