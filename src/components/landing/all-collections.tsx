import Image from "next/image";
import Link from "next/link";

import { ScrollReveal } from "@/components/common/scroll-reveal";

import type { Category } from "@/types/category";

interface AllCollectionsProps {
    categories: Category[];
}

export function AllCollections({
    categories,
}: AllCollectionsProps) {
    return (
        <section className="section-shell bg-ink text-white">
            <div className="site-container">
                <ScrollReveal direction="up">
                    <div className="mb-12 md:mb-16">
                        <p
                            dir="ltr"
                            className="mb-4 text-xs tracking-[0.18em] text-white/45"
                        >
                            EXPLORE COLLECTIONS
                        </p>

                        <h2 className="text-3xl font-medium md:text-5xl">
                            مجموعه‌ها
                        </h2>
                    </div>
                </ScrollReveal>

                <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map(
                        (category, index) => (
                            <ScrollReveal
                                key={category.id}
                                direction="up"
                                delay={index * 70}
                            >
                                <Link
                                    href={`/collections/${category.slug}`}
                                    className="group relative block aspect-[4/5] overflow-hidden bg-ink"
                                >
                                    {category.coverImage ? (
                                        <Image
                                            src={category.coverImage}
                                            alt={category.name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover opacity-75 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-90"
                                        />
                                    ) : null}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                                        <p
                                            dir="ltr"
                                            className="text-xs tracking-[0.16em] text-white/50"
                                        >
                                            COLLECTION{" "}
                                            {String(index + 1).padStart(
                                                2,
                                                "0",
                                            )}
                                        </p>

                                        <h3 className="mt-3 text-2xl font-medium md:text-3xl">
                                            {category.name}
                                        </h3>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}