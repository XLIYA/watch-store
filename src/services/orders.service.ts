import { apiClient } from "@/services/api/api-client";

import type {
    CreateOrderPayload,
    Order,
} from "@/types/order";

export async function createOrder(
    payload: CreateOrderPayload,
): Promise<Order> {
    const response =
        await apiClient.post<Order>(
            "/orders",
            payload,
        );

    return response.data;
}

export async function getOrderById(
    orderId: number | string,
): Promise<Order> {
    const response =
        await apiClient.get<Order>(
            `/orders/${orderId}`,
        );

    return response.data;
}

export async function updateOrder(
    orderId: number | string,
    payload: Partial<Order>,
): Promise<Order> {
    const response =
        await apiClient.patch<Order>(
            `/orders/${orderId}`,
            payload,
        );

    return response.data;
}