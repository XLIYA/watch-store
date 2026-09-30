"use client";
import { useState, useSyncExternalStore } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2, RefreshCw, CreditCard, Copy, Check, Trash2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCardNumber, readCardHistory, parseCardHistory, rememberCard, subscribeCardHistory, clearCardHistory } from "@/features/checkout/card-history";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersianDigitInput } from "@/components/ui/persian-digit-input";
import { usePaymentCodeMutation } from "@/features/checkout/payment-mutations";
import { getApiErrorMessage } from "@/services/api/api-error";
import { persianDigits } from "@/lib/digits";
import { validatePaymentFields, type PaymentFields } from "../../../shared/payment-validation";
import rules from "../../../shared/payment-rules.json";

/** قواعد فرم و API مشترک‌اند؛ اطلاعات کارت فقط در حافظهٔ فرم می‌ماند و در storage ذخیره نمی‌شود. */
export function PaymentForm({ id, token, captcha, disabled, paying, cancelling, onPay, onCancel }: {
  id: string; token: string; captcha: string; disabled: boolean; paying: boolean; cancelling: boolean;
  onPay: (fields: PaymentFields) => Promise<void>; onCancel: () => void;
}) {
  const form = useForm<PaymentFields>({ defaultValues: { cardNumber: "", cvv: "", month: "", year: "", captcha: "", pin: "", email: "" } });
  const code = usePaymentCodeMutation();
  const [securityCode, setSecurityCode] = useState(captcha);
  const [pin, setPin] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const savedCards = parseCardHistory(useSyncExternalStore(subscribeCardHistory, readCardHistory, () => "[]"));
  const [kind, setKind] = useState<"captcha" | "pin">("pin");
  const busy = disabled || code.isPending;
  /** کد از سرور صادر می‌شود؛ تعویض آن ورودی قبلی را پاک می‌کند تا مقدار نامعتبر دوباره ارسال نشود. */
  async function requestCode(nextKind: "captcha" | "pin") {
    setKind(nextKind);
    try {
      const response = await code.mutateAsync({ id, token, kind: nextKind });
      if (nextKind === "captcha") { setSecurityCode(response.code); form.setValue("captcha", ""); }
      else { setPin(response.code); setCopyState("idle"); form.setValue("pin", ""); }
    } catch { /* خطا کنار دکمه نمایش داده می‌شود؛ مقادیر فرم برای اصلاح حفظ می‌شوند. */ }
  }
  const fields: { name: keyof PaymentFields; label: string; maxLength: number; secret?: boolean }[] = [
    { name: "cardNumber", label: "شمارهٔ کارت", maxLength: 19 },
    { name: "cvv", label: "کد شناسایی کارت (CVV2)", maxLength: 4, secret: true },
    { name: "month", label: "ماه انقضا", maxLength: 2 },
    { name: "year", label: "سال انقضا", maxLength: 2 },
    { name: "captcha", label: "کد امنیتی", maxLength: 5 },
    { name: "pin", label: "رمز پویا", maxLength: 6, secret: true },
  ];
  return <form noValidate autoComplete="off" className="space-y-6" onSubmit={form.handleSubmit(async values => {
    form.clearErrors();
    const errors = validatePaymentFields(values);
    for (const [name, message] of Object.entries(errors)) form.setError(name as keyof PaymentFields, { message });
    const first = Object.keys(errors)[0] as keyof PaymentFields | undefined;
    if (first) { form.setFocus(first); return; }
    rememberCard(values.cardNumber);
    await onPay(values);
  })}>
    <h2 className="flex items-center gap-2 font-medium"><CreditCard className="size-5 text-forest" /> اطلاعات کارت</h2>
    <fieldset disabled={busy} className="grid min-w-0 grid-cols-2 gap-4 disabled:opacity-70">
      {fields.map(field => <div key={field.name} className={["month", "year"].includes(field.name) ? "space-y-2" : "col-span-2 space-y-2"}>
        <Label htmlFor={field.name}>{field.label}</Label>
        {field.name === "cardNumber" ? <Controller control={form.control} name="cardNumber" render={({field: card}) => <Input {...card} id="cardNumber" inputMode="numeric" autoComplete="off" maxLength={19} dir="ltr" className="h-12 text-center tracking-widest" aria-invalid={Boolean(form.formState.errors.cardNumber)} aria-describedby="cardNumber-error" value={formatCardNumber(card.value)} onChange={event => {
          const raw = event.target.value, caret = event.target.selectionStart ?? raw.length;
          const before = raw.slice(0, caret).replace(/ /g, "").length;
          const formatted = formatCardNumber(raw);
          card.onChange(formatted);
          requestAnimationFrame(() => { const position = Math.min(formatted.length, before + Math.max(0, Math.floor((before - 1) / 4))); event.target.setSelectionRange(position, position); });
        }} />} /> : <PersianDigitInput id={field.name} {...form.register(field.name)} type={field.secret ? "password" : "text"} inputMode="numeric" maxLength={field.maxLength} dir="ltr" className="h-12 text-right tracking-wider" aria-invalid={Boolean(form.formState.errors[field.name])} aria-describedby={field.name + "-error"} />}
        {field.name === "cardNumber" && savedCards.length > 0 && <div className="flex gap-2">
          <Select onValueChange={number => form.setValue("cardNumber", formatCardNumber(number), {shouldValidate: true})}><SelectTrigger aria-label="کارت‌های قبلی این نشست"><SelectValue placeholder="کارت‌های قبلی این نشست" /></SelectTrigger><SelectContent>{savedCards.map(number => <SelectItem key={number} value={number}><span dir="ltr">{persianDigits(number.slice(0,4))} •••• •••• {persianDigits(number.slice(-4))}</span></SelectItem>)}</SelectContent></Select>
          <Button type="button" variant="outline" size="icon" aria-label="پاک‌کردن کارت‌های قبلی" onClick={clearCardHistory}><Trash2 className="size-4" /></Button>
        </div>}
        <p id={field.name + "-error"} className="text-xs text-destructive" role={form.formState.errors[field.name] ? "alert" : undefined}>{form.formState.errors[field.name]?.message}</p>
        {field.name === "captcha" && <div className="flex items-center gap-3">
          <span aria-label="کد امنیتی نمایش داده‌شده" className="select-none rounded-lg border bg-secondary px-6 py-2 text-xl tracking-[.35em] line-through decoration-forest/30" dir="ltr">{persianDigits(securityCode)}</span>
          <Button type="button" size="icon" variant="outline" aria-label="تغییر کد امنیتی" onClick={() => requestCode("captcha")}>{code.isPending && kind === "captcha" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}</Button>
        </div>}
        {field.name === "pin" && <div className="space-y-2">
          <Button type="button" variant="outline" className="w-full" onClick={() => requestCode("pin")}>{code.isPending && kind === "pin" && <Loader2 className="size-4 animate-spin" />} دریافت رمز پرداخت</Button>
          {pin && <div role="status" className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
            <span>رمز: <b dir="ltr">{persianDigits(pin)}</b> — اعتبار {persianDigits(String(rules.codeSeconds))} ثانیه</span>
            <Button type="button" variant="outline" size="sm" disabled={copyState === "copying"} onClick={async () => {
              setCopyState("copying");
              try { await navigator.clipboard.writeText(pin); setCopyState("copied"); } catch { setCopyState("error"); }
            }}>{copyState === "copying" ? <Loader2 className="size-4 animate-spin" /> : copyState === "copied" ? <Check className="size-4" /> : <Copy className="size-4" />}{copyState === "copied" ? "کپی شد" : "کپی رمز"}</Button>
            {copyState === "error" && <span role="alert">کپی مجاز نیست؛ رمز را دستی وارد کنید.</span>}
          </div>}
        </div>}
      </div>)}
      <div className="col-span-2 space-y-2"><Label htmlFor="payment-email">ایمیل (اختیاری)</Label><Input id="payment-email" {...form.register("email")} type="email" maxLength={254} dir="ltr" className="h-12 text-right" aria-invalid={Boolean(form.formState.errors.email)} />{form.formState.errors.email && <p role="alert" className="text-xs text-destructive">{form.formState.errors.email.message}</p>}</div>
    </fieldset>
    {code.isError && <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(code.error)}</p>}
    <div className="grid grid-cols-2 gap-3">
      <Button type="submit" disabled={busy} className="h-12 bg-emerald-600 text-white hover:bg-emerald-700">{paying && <Loader2 className="size-4 animate-spin" />}{paying ? "در حال تأیید…" : "پرداخت"}</Button>
      <Button type="button" disabled={busy} variant="outline" className="h-12" onClick={onCancel}>{cancelling && <Loader2 className="size-4 animate-spin" />}{cancelling ? "در حال ثبت…" : "انصراف از پرداخت"}</Button>
    </div>
  </form>;
}
