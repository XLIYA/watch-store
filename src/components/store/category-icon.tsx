import { Watch, Gem, Timer, Waves, Gauge, Sparkles } from "lucide-react";

const icons = {
  watch: Watch,
  gem: Gem,
  timer: Timer,
  waves: Waves,
  gauge: Gauge,
  sparkles: Sparkles,
};
/** نام آیکون دادهٔ API است؛ نگاشت محدود هم از import کل کتابخانه جلوگیری می‌کند و هم برای مقدار ناشناخته fallback دارد. */
export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name as keyof typeof icons] ?? Watch;
  return <Icon aria-hidden className={className} />;
}
