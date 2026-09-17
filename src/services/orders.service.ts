import { apiClient } from "@/services/api/api-client";
import { getAdminAccessToken } from "@/services/auth.service";
import { CreateOrderPayload, Order, OrderStatus } from "@/types/order";
import { PaginatedResult } from "@/types/pagination";


/*
 * هدف:
 * تعریف مقادیر قابل استفاده برای فیلتر وضعیت سفارش‌های Admin.
 *
 * محل استفاده:
 * سرویس دریافت سفارش‌ها و صفحه Admin Orders.
 *
 * نحوه کار:
 * مقدار all یعنی هیچ فیلتر Status به Backend ارسال نمی‌شود.
 * سایر مقادیر مستقیماً از OrderStatus گرفته می‌شوند تا
 * Type فیلتر همیشه با مدل اصلی سفارش هماهنگ باقی بماند.
 */
export type AdminOrderStatusFilter =
    | "all"
    | OrderStatus;

export interface GetAdminOrdersParams {
    page?: number;
    limit?: number;
    status?: AdminOrderStatusFilter;
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
    status = "all",
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
    /*
     * هدف:
     * اعمال فیلتر وضعیت سفارش روی درخواست Backend.
     *
     * محل استفاده:
     * داخل getAdminOrders قبل از ارسال درخواست GET.
     *
     * نحوه کار:
     * اگر all انتخاب شده باشد هیچ پارامتر status ارسال نمی‌شود.
     * در غیر این صورت JSON Server فقط سفارش‌های همان وضعیت را برمی‌گرداند.
     */
    if (status !== "all") {
        params.status = status;
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