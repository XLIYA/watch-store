import rules from "../../../shared/checkout-rules.json";
export const DELIVERY_TIME_SLOTS = rules.deliveryTimeSlots;
export const SHIPPING_COST = rules.shippingCost;

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
