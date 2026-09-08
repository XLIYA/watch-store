interface ProductPageProps {
    params: Promise<{
        productId: string;
    }>;
}

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { productId } = await params;

    return (
        <main className="p-10">
            <h1 className="text-3xl font-semibold">
                Product Detail
            </h1>

            <p className="mt-4">
                Product ID: {productId}
            </p>
        </main>
    );
}