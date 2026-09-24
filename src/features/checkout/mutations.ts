"use client";
import { useMutation } from "@tanstack/react-query";
import { createOrder, updateOrder } from "@/services/orders.service";
import type { Order } from "@/types/order";
/** ثبت سفارش از GETها جداست؛ فرم validation و mutation چرخهٔ درخواست را مدیریت می‌کند. */
export function useCreateOrderMutation(){return useMutation({mutationFn:createOrder});}
export function useUpdateOrderMutation(){return useMutation({mutationFn:({id,patch}:{id:number|string;patch:Partial<Order>})=>updateOrder(id,patch)});}
