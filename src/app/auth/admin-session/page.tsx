import { AdminSessionRecovery } from "@/features/auth/admin-session-recovery";
import { adminDestination } from "@/features/auth/admin-destination";

/** صفحهٔ عمومی فقط نشست را بازیابی می‌کند؛ محتوای مدیریت پس از عبور دوباره از proxy قابل دسترسی است. */
export default async function RecoveryPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AdminSessionRecovery destination={adminDestination(next)} />;
}
