import { getErrorStatus } from "@/services/api/api-error";
import rules from "../../../shared/payment-rules.json";

/** رسید قطعی دیگر polling ندارد؛ خطای موقت حداکثر سه بار با فاصلهٔ افزایشی بررسی می‌شود. */
export function paymentRefreshInterval(
  status: string | undefined,
  error: unknown,
  failures: number,
) {
  if (status === "paid" || status === "failed") return false;
  const code = getErrorStatus(error);
  if (
    error &&
    (failures >= 3 || (code !== undefined && code < 500 && code !== 429))
  )
    return false;
  return rules.pollMilliseconds * Math.min(4, 2 ** failures);
}
