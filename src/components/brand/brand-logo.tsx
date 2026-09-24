import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";

/** هدر و فوتر یک نشان مشترک دارند؛ SVG مستقل در favicon نیز استفاده می‌شود و در هر اندازه واضح می‌ماند. */
export function BrandLogo({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label={brand.title}
    >
      <Image src={brand.mark} alt="" width={42} height={42} />
      <span className="grid gap-1">
        <span
          dir="rtl"
          className="whitespace-nowrap text-right text-lg font-medium"
        >
          {brand.title}
        </span>
        <span className="text-[10px] tracking-wide opacity-60">
          {brand.title} · انتخابی ماندگار
        </span>
      </span>
    </Link>
  );
}
