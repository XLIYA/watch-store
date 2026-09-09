import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="font-heading text-6xl font-medium tracking-[0.16em]">
          WATCH STORE
        </p>

        <h1 className="mt-6 text-3xl font-medium">
          فروشگاه تخصصی ساعت
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          تجربه‌ای متفاوت از انتخاب ساعت‌های لوکس
        </p>

        <Link
          href="/shop"
          className="mt-10 inline-block border-b border-foreground pb-1 text-sm"
        >
          ورود به فروشگاه
        </Link>
      </div>
    </main>
  );
}