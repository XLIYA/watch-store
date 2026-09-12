import { apiClient } from "@/services/api/api-client";
import { getAdminAccessToken } from "@/services/auth.service";

import type {
    CreateOrderPayload,
    Order,
} from "@/types/order";

import type {
    PaginatedResult,
} from "@/types/pagination";

export type AdminOrderDeliveryFilter =
    | "all"
    | "delivered"
    | "undelivered";

export interface GetAdminOrdersParams {
    page?: number;
    limit?: number;
    deliveryStatus?: AdminOrderDeliveryFilter;
}

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

export async function getAdminOrders({
    page = 1,
    limit = 10,
    deliveryStatus = "all",
}: GetAdminOrdersParams = {}): Promise<
    PaginatedResult<Order>
> {
    const params: Record<
        string,
        string | number
    > = {
        _page: page,
        _limit: limit,
        _sort: "createdAt",
        _order: "desc",
    };

    if (
        deliveryStatus ===
        "delivered"
    ) {
        params.status =
            "completed";
    }

    if (
        deliveryStatus ===
        "undelivered"
    ) {
        params.status_ne =
            "completed";
    }

    const accessToken =
        getAdminAccessToken();

    const response =
        await apiClient.get<Order[]>(
            "/orders",
            {
                params,

                headers: accessToken
                    ? {
                        token:
                            accessToken,
                    }
                    : undefined,
            },
        );

    const total = Number(
        response.headers[
        "x-total-count"
        ] ??
        response.data.length,
    );

    return {
        data: response.data,
        total,
        page,
        limit,
        totalPages:
            Math.ceil(
                total / limit,
            ),
    };
}