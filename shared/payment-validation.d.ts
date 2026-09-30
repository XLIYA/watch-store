export interface PaymentFields {
  cardNumber: string;
  cvv: string;
  month: string;
  year: string;
  captcha: string;
  pin: string;
  email: string;
}
export function normalizePaymentDigits(value: unknown): string;
export function validatePaymentFields(fields: Partial<PaymentFields>, now?: Date): Partial<Record<keyof PaymentFields, string>>;
