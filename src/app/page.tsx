import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-semibold">
          Watch Store
        </h1>

        <p className="mt-4 text-neutral-500">
          Luxury Watch Experience
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-block underline"
        >
          ورود به فروشگاه
        </Link>
      </div>
    </main>
  );
}