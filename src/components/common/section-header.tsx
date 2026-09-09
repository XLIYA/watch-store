import Link from "next/link";

interface SectionHeaderProps {
    title: string;
    eyebrow?: string;

    href?: string;
    linkLabel?: string;
}

export function SectionHeader({
    title,
    eyebrow,
    href,
    linkLabel = "مشاهده همه",
}: SectionHeaderProps) {
    return (
        <div className="flex items-end justify-between gap-6">
            <div>
                {eyebrow ? (
                    <p className="section-eyebrow mb-3">
                        {eyebrow}
                    </p>
                ) : null}

                <h2 className="section-title">
                    {title}
                </h2>
            </div>

            {href ? (
                <Link
                    href={href}
                    className="luxury-transition shrink-0 border-b border-foreground/40 pb-1 text-sm hover:border-foreground"
                >
                    {linkLabel}
                </Link>
            ) : null}
        </div>
    );
}