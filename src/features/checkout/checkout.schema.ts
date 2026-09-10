import { z } from "zod";

const iranianMobileRegex = /^09\d{9}$/;

const postalCodeRegex = /^\d{10}$/;

function getMinimumDeliveryDate() {
    const date = new Date();

    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 7);

    return date;
}

function isValidFutureDeliveryDate(
    value: string,
) {
    if (!value) {
        return false;
    }

    const selectedDate = new Date(
        `${value}T00:00:00`,
    );

    if (
        Number.isNaN(
            selectedDate.getTime(),
        )
    ) {
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
            .regex(
                iranianMobileRegex,
                "شماره موبایل باید با 09 شروع شود و 11 رقم باشد.",
            ),

        postalCode: z
            .string()
            .trim()
            .regex(
                postalCodeRegex,
                "کد پستی باید ۱۰ رقم باشد.",
            ),

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
                        "تاریخ تحویل باید حداقل ۷ روز بعد از امروز باشد.",
                },
            ),

        deliveryTime: z
            .string()
            .min(
                1,
                "ساعت تحویل را انتخاب کنید.",
            ),

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