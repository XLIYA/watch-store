export function BrandLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-white text-ink">
            <div className="flex flex-col items-center">
                <p
                    dir="ltr"
                    className="font-heading text-3xl font-medium tracking-[0.2em] sm:text-4xl"
                >
                    WATCH STORE
                </p>

                <div
                    className="mt-7 size-5 animate-spin rounded-full border border-ink/15 border-t-ink"
                    aria-hidden="true"
                />

                <span className="sr-only">
                    در حال بارگذاری
                </span>
            </div>
        </div>
    );
}