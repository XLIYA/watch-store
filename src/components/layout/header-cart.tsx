"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
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
import { formatNumber, formatPrice } from "@/lib/format";
import { selectCartTotals } from "@/features/cart/cart.selectors";
import { setItemQuantity, removeItem } from "@/features/cart/cart.slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { CartItem } from "@/features/cart/cart.types";

/** سبد کناری همان state صفحهٔ سبد را تغییر می‌دهد؛ reducer سقف موجودی را کنترل و storage تغییرات را حفظ می‌کند. */
export function HeaderCart({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const { totalQuantity, totalPrice } = useAppSelector(selectCartTotals);
  const [removing, setRemoving] = useState<CartItem | null>(null);
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="left"
        showCloseButton={false}
        className="gap-0 data-[side=left]:w-full data-[side=left]:sm:max-w-md"
        dir="rtl"
      >
        <SheetHeader className="flex-row items-center justify-between border-b p-5">
          <div>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5" />
              سبد خرید
            </SheetTitle>
            <SheetDescription className="mt-2">
              {formatNumber(totalQuantity)} کالا
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="بستن سبد خرید">
              <X />
            </Button>
          </SheetClose>
        </SheetHeader>
        {!items.length ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
            <ShoppingBag className="size-12 text-forest" />
            <p>سبد خرید شما خالی است</p>
            <Button asChild>
              <Link href="/shop" onClick={onClose}>
                مشاهدهٔ ساعت‌ها
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <article key={item.lineId} className="flex gap-4 border-b py-5">
                  <Link
                    href={`/product/${item.productId}`}
                    onClick={onClose}
                    className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary"
                  >
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1 space-y-3">
                    <Link
                      href={`/product/${item.productId}`}
                      onClick={onClose}
                      dir="auto"
                      className="block text-right text-sm font-medium leading-6"
                    >
                      {item.name}
                    </Link>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="size-3 rounded-full border"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      {item.colorName}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div
                        className="flex items-center rounded-full border"
                        aria-label={`تعداد ${item.name}`}
                      >
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`کاهش تعداد ${item.name}`}
                          onClick={() =>
                            item.quantity === 1
                              ? setRemoving(item)
                              : dispatch(
                                  setItemQuantity({
                                    lineId: item.lineId,
                                    quantity: item.quantity - 1,
                                  }),
                                )
                          }
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span
                          className="min-w-7 text-center text-sm"
                          aria-live="polite"
                        >
                          {formatNumber(item.quantity)}
                        </span>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          disabled={item.quantity >= item.maxQuantity}
                          aria-label={`افزایش تعداد ${item.name}`}
                          onClick={() =>
                            dispatch(
                              setItemQuantity({
                                lineId: item.lineId,
                                quantity: item.quantity + 1,
                              }),
                            )
                          }
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`حذف ${item.name}`}
                        onClick={() => setRemoving(item)}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <p className="text-sm">
                      {formatPrice(item.unitPrice * item.quantity)} تومان
                    </p>
                    {item.quantity >= item.maxQuantity && (
                      <p className="text-xs text-muted-foreground">
                        حداکثر موجودی این رنگ
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <div className="space-y-5 border-t bg-card p-5">
              <p className="flex justify-between text-sm">
                <span>مجموع</span>
                <strong aria-live="polite">
                  {formatPrice(totalPrice)} تومان
                </strong>
              </p>
              <Button asChild className="w-full">
                <Link href="/cart" onClick={onClose}>
                  مشاهدهٔ سبد و تکمیل سفارش
                </Link>
              </Button>
            </div>
          </>
        )}
        <AlertDialog
          open={Boolean(removing)}
          onOpenChange={(open) => {
            if (!open) setRemoving(null);
          }}
        >
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>حذف از سبد خرید؟</AlertDialogTitle>
              <AlertDialogDescription>
                {removing?.name} از سبد خرید حذف شود؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>انصراف</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (removing) dispatch(removeItem(removing.lineId));
                  setRemoving(null);
                }}
              >
                حذف محصول
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
