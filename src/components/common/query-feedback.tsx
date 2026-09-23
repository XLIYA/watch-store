/**
 * پیام انتظار و خطای جدول‌های مدیریت در این جزء مشترک نمایش داده می‌شود.
 * refetch از Query صاحب داده دریافت می‌شود تا دکمهٔ تلاش دوباره همان درخواست و فیلترها را اجرا کند.
 */
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/services/api/api-error";

export function QueryFeedback({
  fetching,
  error,
  retry,
}: {
  fetching: boolean;
  error: unknown;
  retry: () => void;
}) {
  if (error)
    return (
      <div
        role="alert"
        className="flex items-center gap-3 text-sm text-destructive"
      >
        <span>{getApiErrorMessage(error)}</span>
        <Button variant="outline" onClick={retry} disabled={fetching}>
          تلاش دوباره
        </Button>
      </div>
    );
  return fetching ? (
    <p role="status" className="text-sm text-muted-foreground">
      در حال به‌روزرسانی اطلاعات...
    </p>
  ) : null;
}
