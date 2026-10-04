import Link from "next/link";
import { ArrowUpLeft, Compass, Scale, Heart } from "lucide-react";

/** ورودی مشترک ابزارهای انتخاب؛ لندینگ و فروشگاه از مسیرهای یکسان استفاده می‌کنند. */
export function ExperienceIntro() {
  const items = [
    {
      href: "/finder",
      title: "ساعت شما کدام است؟",
      copy: "از سبک و بودجه شروع کنید.",
      Icon: Compass,
    },
    {
      href: "/compare",
      title: "تفاوت‌ها را ببینید",
      copy: "سه انتخاب، کنار یکدیگر.",
      Icon: Scale,
    },
    {
      href: "/favorites",
      title: "برای بعد نگه دارید",
      copy: "ساعت‌های محبوبتان، یک‌جا.",
      Icon: Heart,
    },
  ];
  return (
    <section
      className="site-container py-12 md:py-16"
      aria-label="راهنمای انتخاب ساعت"
    >
      <div className="grid overflow-hidden rounded-2xl border bg-card md:grid-cols-3">
        {items.map(({ href, title, copy, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 border-b p-6 transition-colors last:border-0 hover:bg-secondary/50 focus-visible:outline-2 focus-visible:outline-forest md:border-b-0 md:border-l md:p-8"
          >
            <span className="rounded-xl bg-forest/5 p-3 text-forest">
              <Icon className="size-5" strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <h2 className="text-sm font-medium leading-7">{title}</h2>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {copy}
              </p>
            </div>
            <ArrowUpLeft className="mt-2 size-4 text-forest transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
