import rules from "../../../shared/checkout-rules.json";
import { getMinimumDeliveryDate, parseIsoDate } from "@/features/checkout/delivery-date";
import { z } from "zod";
import { normalizeDigits } from "@/lib/digits";

const iranianMobileRegex = /^09\d{9}$/;

const postalCodeRegex = /^\d{10}$/;



function isValidFutureDeliveryDate(
    value: string,
) {
    if (!value) {
        return false;
    }

    const selectedDate = parseIsoDate(value);

    if (!selectedDate) {
        return false;
    }

    const minimumDate =
        getMinimumDeliveryDate();

    return (
        selectedDate >=
        minimumDate
    );
}

export const checkoutSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(
                3,
                "نام و نام خانوادگی را کامل وارد کنید.",
            )
            .max(
                80,
                "نام و نام خانوادگی بیش از حد طولانی است.",
            ),

        mobile: z
            .string()
            .trim()
            .transform(normalizeDigits)
            .pipe(z.string().regex(
                iranianMobileRegex,
                "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.",
            )),

        postalCode: z
            .string()
            .trim()
            .transform(normalizeDigits)
            .pipe(z.string().regex(
                postalCodeRegex,
                "کد پستی باید ۱۰ رقم باشد.",
            )),

        address: z
            .string()
            .trim()
            .min(
                10,
                "آدرس را به‌صورت کامل وارد کنید.",
            )
            .max(
                300,
                "آدرس بیش از حد طولانی است.",
            ),

        plaque: z
            .string()
            .trim()
            .min(
                1,
                "پلاک را وارد کنید.",
            )
            .max(
                10,
                "پلاک واردشده معتبر نیست.",
            ),

        unit: z
            .string()
            .trim()
            .max(
                10,
                "شماره واحد واردشده معتبر نیست.",
            )
            .optional(),

        latitude: z
            .number()
            .nullable(),

        longitude: z
            .number()
            .nullable(),

        deliveryDate: z
            .string()
            .min(
                1,
                "تاریخ تحویل را انتخاب کنید.",
            )
            .refine(
                isValidFutureDeliveryDate,
                {
                    message:
                        `تاریخ تحویل باید حداقل ${rules.minimumDeliveryDays.toLocaleString("fa-IR")} روز بعد از امروز باشد.`,
                },
            ),

        deliveryTime: z
            .string()
            .min(
                1,
                "ساعت تحویل را انتخاب کنید.",
            ).refine(value => rules.deliveryTimeSlots.includes(value), "ساعت تحویل معتبر نیست."),

        note: z
            .string()
            .trim()
            .max(
                500,
                "توضیحات سفارش حداکثر می‌تواند ۵۰۰ کاراکتر باشد.",
            )
            .optional(),
    })
    .superRefine(
        (data, ctx) => {
            if (
                data.latitude === null ||
                data.longitude === null
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["latitude"],
                    message:
                        "موقعیت تحویل را روی نقشه انتخاب کنید.",
                });
            }
        },
    );


export type CheckoutFormValues =
    z.infer<
        typeof checkoutSchema
    >;
