"use client";
import { useState, useSyncExternalStore, type ComponentProps } from "react";
import { CreditCard, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { normalizeDigits, persianDigits } from "@/lib/digits";
import {
  clearCardHistory,
  formatCardNumber,
  parseCardHistory,
  readCardHistory,
  subscribeCardHistory,
} from "@/features/checkout/card-history";

/** ورودی درگاه با فوکوس پیشنهاد می‌دهد؛ انتخاب با موس یا کلید جهت/Enter شماره را در همان فیلد قرار می‌دهد. */
export function CardNumberInput({
  value,
  onValueChange,
  ...props
}: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const cards = parseCardHistory(
    useSyncExternalStore(subscribeCardHistory, readCardHistory, () => "[]"),
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const prefix = normalizeDigits(value).replace(/ /g, "");
  const suggestions = cards.filter(
    (card) => !prefix || card.startsWith(prefix),
  );
  const expanded = open && suggestions.length > 0;
  const choose = (card: string) => {
    onValueChange(formatCardNumber(card));
    setOpen(false);
    setActive(-1);
  };
  return (
    <Popover open={expanded} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          {...props}
          value={formatCardNumber(value)}
          inputMode="numeric"
          autoComplete="off"
          maxLength={19}
          dir="ltr"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls="saved-card-options"
          aria-activedescendant={
            expanded && active >= 0 ? `saved-card-${active}` : undefined
          }
          className="h-12 text-center tracking-widest"
          onFocus={(event) => {
            setOpen(true);
            props.onFocus?.(event);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }
            if (
              suggestions.length &&
              ["ArrowDown", "ArrowUp"].includes(event.key)
            ) {
              event.preventDefault();
              setOpen(true);
              setActive((index) =>
                event.key === "ArrowDown"
                  ? (index + 1) % suggestions.length
                  : index <= 0
                    ? suggestions.length - 1
                    : index - 1,
              );
            }
            if (expanded && event.key === "Enter" && active >= 0) {
              event.preventDefault();
              choose(suggestions[active]);
            }
          }}
          onChange={(event) => {
            const input = event.currentTarget,
              raw = input.value;
            const before = raw
              .slice(0, input.selectionStart ?? raw.length)
              .replace(/ /g, "").length;
            const formatted = formatCardNumber(raw);
            onValueChange(formatted);
            setOpen(true);
            setActive(-1);
            requestAnimationFrame(() => {
              const position = Math.min(
                formatted.length,
                before + Math.max(0, Math.floor((before - 1) / 4)),
              );
              input.setSelectionRange(position, position);
            });
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-64 gap-2 p-2"
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if ((event.target as HTMLElement).id === props.id)
            event.preventDefault();
        }}
      >
        <p className="px-2 py-1 text-xs text-muted-foreground">کارت‌های اخیر</p>
        <div id="saved-card-options" role="listbox" aria-label="کارت‌های اخیر">
          {suggestions.map((card, index) => (
            <Button
              key={card}
              id={`saved-card-${index}`}
              type="button"
              variant="ghost"
              role="option"
              aria-selected={active === index}
              className={`w-full justify-between ${active === index ? "bg-secondary" : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(card)}
            >
              <CreditCard className="size-4" />
              <span dir="ltr">
                {persianDigits(card.slice(0, 4))} •••• ••••{" "}
                {persianDigits(card.slice(-4))}
              </span>
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            clearCardHistory();
            setOpen(false);
          }}
        >
          <Trash2 className="size-3.5" />
          پاک‌کردن کارت‌ها
        </Button>
      </PopoverContent>
    </Popover>
  );
}
