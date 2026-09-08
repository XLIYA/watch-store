interface CollectionPageProps {
    params: Promise<{
        categorySlug: string;
    }>;
}

export default async function CollectionPage({
    params,
}: CollectionPageProps) {
    const { categorySlug } = await params;

    return (
        <main className="p-10">
            <h1 className="text-3xl font-semibold">
                Collection
            </h1>

            <p className="mt-4">
                Category: {categorySlug}
            </p>
        </main>
    );
}