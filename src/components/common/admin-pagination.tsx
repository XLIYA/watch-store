"use client";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  busy?: boolean;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  page: requestedPage,
  totalPages: requestedTotalPages,
  busy = false,
  onPageChange,
}: AdminPaginationProps) {
  // حتی نتیجهٔ خالی یک صفحهٔ نمایشی دارد؛ کنترل هر سه جدول همیشه دیده می‌شود.
  const totalPages = Math.max(1, requestedTotalPages);
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  // فقط همسایه‌های صفحه ساخته می‌شوند؛ جدول‌های سه بخش مدیریت برای دادهٔ بزرگ آرایهٔ کامل نمی‌سازند.
  const pages = [
    ...new Set([1, page - 2, page - 1, page, page + 1, page + 2, totalPages]),
  ]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  // هنگام placeholder، اعداد صفحهٔ قبل مبنای حرکت بعدی نیستند؛ کنترل‌ها موقتاً قفل می‌شوند.
  const changePage = (next: number) => {
    if (!busy && next >= 1 && next <= totalPages && next !== page)
      onPageChange(next);
  };
  return (
    <nav
      aria-label="صفحه‌بندی جدول"
      aria-busy={busy}
      className="flex flex-wrap items-center justify-center gap-2"
      dir="rtl"
    >
      <Button
        variant="outline"
        disabled={busy || page <= 1}
        onClick={() => changePage(page - 1)}
      >
        قبلی
      </Button>
      {pages.map((value, index) => (
        <span key={value} className="flex items-center gap-2">
          {index > 0 && value - pages[index - 1] > 1 && (
            <span aria-hidden>…</span>
          )}
          <Button
            variant={value === page ? "default" : "outline"}
            disabled={busy}
            aria-current={value === page ? "page" : undefined}
            onClick={() => changePage(value)}
          >
            {formatNumber(value)}
          </Button>
        </span>
      ))}
      <Button
        variant="outline"
        disabled={busy || page >= totalPages}
        onClick={() => changePage(page + 1)}
      >
        بعدی
      </Button>
    </nav>
  );
}
