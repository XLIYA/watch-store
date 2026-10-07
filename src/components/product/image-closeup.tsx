"use client";
import { useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** بزرگ‌نمایی همان عکس واقعی در گالری؛ اسکرول بومی برای جابه‌جایی تصویر روی موبایل و کیبورد استفاده می‌شود. */
export function ImageCloseup({ src, name }: { src: string; name: string }) {
  const [zoom, setZoom] = useState(1);
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setZoom(1);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 z-10 bg-card/95 shadow-sm"
        >
          <ZoomIn />
          نمای نزدیک
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl" dir="rtl">
        <DialogHeader className="pe-8">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            برای دیدن جزئیات بزرگ‌نمایی کنید؛ تصویر بزرگ را با اسکرول جابه‌جا
            کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={zoom <= 1}
            onClick={() => setZoom((value) => Math.max(1, value - 0.5))}
            aria-label="کوچک‌نمایی"
          >
            <ZoomOut />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={zoom >= 3}
            onClick={() => setZoom((value) => Math.min(3, value + 0.5))}
            aria-label="بزرگ‌نمایی"
          >
            <ZoomIn />
          </Button>
          <Button variant="ghost" onClick={() => setZoom(1)}>
            اندازهٔ اصلی
          </Button>
          <span
            className="self-center text-xs text-muted-foreground"
            role="status"
          >
            {zoom.toLocaleString("fa-IR")} برابر
          </span>
        </div>
        <div
          className="h-[55dvh] overflow-auto rounded-xl border bg-secondary"
          tabIndex={0}
          aria-label="تصویر قابل جابه‌جایی"
        >
          <div
            className="relative"
            style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
          >
            <Image
              src={src}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
