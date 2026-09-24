"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
/** جایگزین confirm مرورگر برای خروج از فرم؛ focus و Escape را Radix مدیریت می‌کند. */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>خروج بدون ذخیره؟</AlertDialogTitle>
          <AlertDialogDescription>
            تغییرات این فرم ذخیره نشده‌اند. با خروج، آن‌ها کنار گذاشته می‌شوند.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ادامهٔ ویرایش</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>خروج از فرم</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
