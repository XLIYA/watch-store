import Link from "next/link";

interface LuxuryLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export function LuxuryLink({
    href,
    children,
    className = "",
}: LuxuryLinkProps) {
    return (
        <Link
            href={href}
            className={`
        luxury-transition
        inline-flex
        items-center
        border-b
        border-current/40
        pb-1
        text-sm
        hover:border-current
        ${className}
      `}
        >
            {children}
        </Link>
    );
}