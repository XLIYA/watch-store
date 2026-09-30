"use client";
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/services/orders.service";

/** ثبت سفارش از GETها جداست؛ فرم validation و mutation چرخهٔ درخواست را مدیریت می‌کند. */
export function useCreateOrderMutation(){return useMutation({mutationFn:createOrder});}
