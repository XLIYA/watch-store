"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAdmin, logoutAdmin } from "@/services/auth.service";
import { sessionQueryKey } from "./use-admin-session";
/** صفحات ورود و خروج فقط نتیجه را مصرف می‌کنند؛ cache نشست در یک محل همگام می‌شود. */
export function useLoginMutation(){const client=useQueryClient();return useMutation({mutationFn:loginAdmin,onSuccess:async session=>{await client.cancelQueries({queryKey:["admin"]});client.removeQueries({queryKey:["admin"]});client.setQueryData(sessionQueryKey,session);}});}
export function useLogoutMutation(){const client=useQueryClient();return useMutation({mutationFn:logoutAdmin,onSuccess:()=>{client.setQueryData(sessionQueryKey,null);client.removeQueries({queryKey:["admin"]});}});}
