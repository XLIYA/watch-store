export const DELIVERY_TIME_SLOTS = [
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
] as const;

export const DEFAULT_CHECKOUT_VALUES = {
    fullName: "",
    mobile: "",
    postalCode: "",
    address: "",
    plaque: "",
    unit: "",
    latitude: null,
    longitude: null,
    deliveryDate: "",
    deliveryTime: "",
    note: "",
};