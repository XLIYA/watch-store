import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "db.json");

const db = JSON.parse(
    fs.readFileSync(dbPath, "utf8"),
);

const products = db.products ?? [];
const existingOrders = db.orders ?? [];

if (products.length === 0) {
    console.error(
        "No products found in db.json.",
    );

    process.exit(1);
}

const customers = [
    {
        fullName: "علی رضایی",
        mobile: "09121234501",
    },
    {
        fullName: "مریم احمدی",
        mobile: "09121234502",
    },
    {
        fullName: "محمد کریمی",
        mobile: "09121234503",
    },
    {
        fullName: "سارا حسینی",
        mobile: "09121234504",
    },
    {
        fullName: "رضا محمدی",
        mobile: "09121234505",
    },
    {
        fullName: "نازنین اکبری",
        mobile: "09121234506",
    },
    {
        fullName: "امیرحسین مرادی",
        mobile: "09121234507",
    },
    {
        fullName: "الهام موسوی",
        mobile: "09121234508",
    },
    {
        fullName: "آرمان جعفری",
        mobile: "09121234509",
    },
    {
        fullName: "پریسا شریفی",
        mobile: "09121234510",
    },
];

const addresses = [
    "تهران، سعادت آباد، خیابان سرو",
    "تهران، پاسداران، خیابان گلستان",
    "کرج، عظیمیه، بلوار شریعتی",
    "تهران، شهرک غرب، بلوار دادمان",
    "کرج، جهانشهر، بلوار جمهوری",
    "تهران، نیاوران، خیابان باهنر",
];

const statuses = [
    "pending_payment",
    "processing",
    "completed",
    "completed",
    "processing",
    "cancelled",
];

function pad(value) {
    return String(value).padStart(2, "0");
}

function toDateString(date) {
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
    ].join("-");
}

function getPaymentStatus(status) {
    switch (status) {
        case "completed":
        case "processing":
            return "paid";

        case "cancelled":
            return "failed";

        default:
            return "pending";
    }
}

function createOrder(index) {
    const orderId =
        10001 + index;

    const customer =
        customers[
            index %
                customers.length
        ];

    const firstProduct =
        products[
            index %
                products.length
        ];

    const secondProduct =
        products[
            (index + 7) %
                products.length
        ];

    const selectedProducts =
        index % 3 === 0
            ? [
                  firstProduct,
                  secondProduct,
              ]
            : [firstProduct];

    const items =
        selectedProducts.map(
            (product, itemIndex) => {
                const variants =
                    product.variants ?? [];

                const variant =
                    variants[
                        (index +
                            itemIndex) %
                            Math.max(
                                variants.length,
                                1,
                            )
                    ];

                const quantity =
                    ((index +
                        itemIndex) %
                        2) +
                    1;

                const unitPrice =
                    Number(
                        product.price ??
                            0,
                    );

                return {
                    lineId: `${product.id}:${
                        variant?.id ??
                        "default"
                    }`,

                    productId:
                        product.id,

                    variantId:
                        variant?.id ??
                        "default",

                    name:
                        product.name,

                    thumbnail:
                        product.thumbnail ??
                        "",

                    colorName:
                        variant?.name ??
                        "پیش‌فرض",

                    colorHex:
                        variant?.hex ??
                        "#111111",

                    unitPrice,

                    quantity,

                    totalPrice:
                        unitPrice *
                        quantity,
                };
            },
        );

    const itemsCount =
        items.reduce(
            (sum, item) =>
                sum +
                item.quantity,
            0,
        );

    const subtotal =
        items.reduce(
            (sum, item) =>
                sum +
                item.totalPrice,
            0,
        );

    const shippingCost =
        subtotal >= 50_000_000
            ? 0
            : 350_000;

    const totalPrice =
        subtotal +
        shippingCost;

    const status =
        statuses[
            index %
                statuses.length
        ];

    const paymentStatus =
        getPaymentStatus(
            status,
        );

    const createdDate =
        new Date();

    createdDate.setDate(
        createdDate.getDate() -
            index,
    );

    createdDate.setHours(
        9 +
            (index % 9),
        (index * 7) % 60,
        0,
        0,
    );

    const createdAt =
        createdDate.getTime();

    const deliveryDate =
        new Date(createdDate);

    deliveryDate.setDate(
        deliveryDate.getDate() +
            7 +
            (index % 5),
    );

    const paidAt =
        paymentStatus === "paid"
            ? createdAt +
              30 * 60 * 1000
            : null;

    return {
        id: orderId,

        customer: {
            fullName:
                customer.fullName,

            mobile:
                customer.mobile,
        },

        delivery: {
            postalCode:
                `14${String(
                    10000000 +
                        index,
                ).slice(-8)}`,

            address:
                addresses[
                    index %
                        addresses.length
                ],

            plaque: String(
                10 +
                    (index % 80),
            ),

            unit:
                index % 4 === 0
                    ? undefined
                    : String(
                          1 +
                              (index %
                                  12),
                      ),

            latitude:
                35.6892 +
                (index % 5) *
                    0.002,

            longitude:
                51.389 +
                (index % 5) *
                    0.002,

            deliveryDate:
                toDateString(
                    deliveryDate,
                ),

            deliveryTime:
                `${pad(
                    10 +
                        (index %
                            8),
                )}:00`,

            note:
                index % 6 === 0
                    ? "لطفاً قبل از تحویل تماس گرفته شود."
                    : undefined,
        },

        items,

        itemsCount,

        subtotal,

        shippingCost,

        totalPrice,

        status,

        paymentStatus,

        createdAt,

        paidAt,
    };
}

const demoOrders =
    Array.from(
        { length: 30 },
        (_, index) =>
            createOrder(index),
    );

const existingIds =
    new Set(
        existingOrders.map(
            (order) =>
                String(order.id),
        ),
    );

const newOrders =
    demoOrders.filter(
        (order) =>
            !existingIds.has(
                String(order.id),
            ),
    );

db.orders = [
    ...existingOrders,
    ...newOrders,
];

fs.writeFileSync(
    dbPath,
    JSON.stringify(
        db,
        null,
        2,
    ),
    "utf8",
);

console.log(
    `Added ${newOrders.length} demo orders.`,
);

console.log(
    `Total orders: ${db.orders.length}`,
);