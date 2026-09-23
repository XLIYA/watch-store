import * as React from "react";
import { cn } from "cn";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

/*
 * هدف:
 * ساخت Wrapper اصلی Pagination با جهت RTL.
 *
 * محل استفاده:
 * تمام Paginationهای پروژه از جمله Orders، Products و Inventory.
 *
 * نحوه کار:
 * dir="rtl" باعث می‌شود ترتیب آیتم‌های Pagination با رابط فارسی
 * هماهنگ باشد و Previous در سمت راست و Next در سمت چپ قرار بگیرد.
 */
function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="صفحه‌بندی"
      data-slot="pagination"
      dir="rtl"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      {...props}
    />
  );
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<
  React.ComponentProps<typeof Button>,
  "size"
> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={
        isActive
          ? "outline"
          : "ghost"
      }
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={
          isActive
            ? "page"
            : undefined
        }
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  );
}

/*
 * هدف:
 * نمایش دکمه رفتن به صفحه قبلی در محیط RTL.
 *
 * محل استفاده:
 * سمت راست Pagination فارسی.
 *
 * نحوه کار:
 * در رابط RTL حرکت به صفحه قبلی با فلش رو به راست نمایش داده می‌شود.
 */
function PaginationPrevious({
  className,
  text = "قبلی",
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  text?: string;
}) {
  return (
    <PaginationLink
      aria-label="رفتن به صفحه قبلی"
      size="default"
      className={cn("gap-1 px-2", className)}
      {...props}
    >
      <ChevronRightIcon data-icon="inline-start" />
      <span className="hidden sm:block">
        {text}
      </span>
    </PaginationLink>
  );
}

/*
 * هدف:
 * نمایش دکمه رفتن به صفحه بعدی در محیط RTL.
 *
 * محل استفاده:
 * سمت چپ Pagination فارسی.
 *
 * نحوه کار:
 * در رابط RTL حرکت به صفحه بعدی با فلش رو به چپ نمایش داده می‌شود.
 */
function PaginationNext({
  className,
  text = "بعدی",
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  text?: string;
}) {
  return (
    <PaginationLink
      aria-label="رفتن به صفحه بعدی"
      size="default"
      className={cn("gap-1 px-2", className)}
      {...props}
    >
      <span className="hidden sm:block">
        {text}
      </span>
      <ChevronLeftIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      <MoreHorizontalIcon />

      <span className="sr-only">
        صفحات بیشتر
      </span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};