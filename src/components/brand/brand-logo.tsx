import Link from "next/link";

interface BrandLogoProps {
  href?: string;
  className?: string;
}

export function BrandLogo({
  href = "/",
  className = "",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center ${className}`}
      aria-label="Watch Store"
    >
      <span className="font-heading text-2xl font-medium tracking-[0.18em]">
        WATCH STORE
      </span>
    </Link>
  );
}