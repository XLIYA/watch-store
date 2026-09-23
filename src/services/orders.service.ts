import { apiClient } from "@/services/api/api-client";
import { endpoints } from "@/config/api";
import { toPaginatedResult } from "@/services/api/pagination";
import { CreateOrderPayload, Order, OrderStatus, PaymentStatus } from "@/types/order";
import { PaginatedResult } from "@/types/pagination";

export type AdminOrderStatusFilter =
    | "all"
    | OrderStatus;

export type AdminPaymentStatusFilter =
    | "all"
    | PaymentStatus;
export interface GetAdminOrdersParams {
    page?: number;
    limit?: number;
    status?: AdminOrderStatusFilter;
    paymentStatus?: AdminPaymentStatusFilter;
    dateFrom?: number;
    dateTo?: number;
}

export async function createOrder(
    payload: CreateOrderPayload,
): Promise<Order> {
    const response =
        await apiClient.post<Order>(
            endpoints.orders,
            payload,
        );

    return response.data;
}

export async function getOrderById(
    orderId: number | string,
): Promise<Order> {
    const response =
        await apiClient.get<Order>(
            endpoints.order(orderId), { requiresAuth: true },
        );

    return response.data;
}

export async function updateOrder(
    orderId: number | string,
    payload: Partial<Order>,
): Promise<Order> {
    const response =
        await apiClient.patch<Order>(
            endpoints.order(orderId),
            payload,
            { requiresAuth: true },
        );

    return response.data;
}

export async function getAdminOrders({
    page = 1,
    limit = 10,
    status = "all",
    paymentStatus = "all",
    dateFrom,
    dateTo,
}: GetAdminOrdersParams = {}, signal?: AbortSignal): Promise<
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

    if (status !== "all") {
        params.status = status;
    }

    if (paymentStatus !== "all") {
        params.paymentStatus = paymentStatus;
    }

    if (typeof dateFrom === "number") {
        params.createdAt_gte = dateFrom;
    }

    if (typeof dateTo === "number") {
        params.createdAt_lte = dateTo;
    }

    const response = await apiClient.get<Order[]>(endpoints.orders, {
        params,
        signal,
        requiresAuth: true,
    });
    return toPaginatedResult(response.data, response.headers["x-total-count"], page, limit);
}
