/**
 * کلاینت مشترک سرویس‌های پروژه است تا ارسال کوکی، خطا و تمدید نشست در هر صفحه تکرار نشود.
 * فقط درخواست‌هایی که requiresAuth دارند بعد از 401 تمدید می‌شوند؛ صفحات عمومی به نشست وابسته نیستند.
 * refreshPromise درخواست‌های هم‌زمان را جمع می‌کند و generation پاسخ نشست قبلی را کنار می‌گذارد.
 */
import axios, { type AxiosError } from "axios";
import { apiConfig, endpoints } from "@/config/api";

declare module "axios" {
  interface AxiosRequestConfig {
    requiresAuth?: boolean;
    sessionGeneration?: number;
    retriedAfterRefresh?: boolean;
    accessVersion?: number;
  }
}

export const SESSION_ENDED_EVENT = "watch-store:session-ended";
export const SESSION_CHANNEL = "watch-store-session";
const options = {
  ...apiConfig,
  withCredentials: true,
  headers: { Accept: "application/json", "X-Requested-With": "watch-store" },
};
// مسیرهای login/refresh مستقل‌اند تا خطای آن‌ها وارد حلقهٔ تمدید نشود. Content-Type به Axios واگذار شده است.
export const authClient = axios.create(options);
export const apiClient = axios.create(options);
let refreshPromise: Promise<unknown> | null = null;
let generation = 0;
let signingOut = false;
let accessVersion = 0;

export function invalidateSession() {
  generation += 1;
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
}

export async function endSession() {
  signingOut = true;
  generation += 1;
  try {
    // پاسخ refresh دیررس نباید پس از logout دوباره کوکی معتبر بسازد.
    await refreshPromise?.catch(() => undefined);
    await authClient.post(endpoints.auth.logout);
    invalidateSession();
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(SESSION_CHANNEL);
      channel.postMessage("logout");
      channel.close();
    }
  } finally {
    signingOut = false;
  }
}

apiClient.interceptors.request.use((config) => {
  if (config.requiresAuth && signingOut)
    throw new axios.CanceledError("Signing out");
  config.sessionGeneration ??= generation;
  config.accessVersion = accessVersion;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (
      response.config.requiresAuth &&
      response.config.sessionGeneration !== generation
    )
      throw new axios.CanceledError("Session changed");
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config;
    if (
      !config?.requiresAuth ||
      error.response?.status !== 401 ||
      typeof window === "undefined"
    )
      throw error;
    if (
      signingOut ||
      config.sessionGeneration !== generation ||
      config.signal?.aborted
    )
      throw new axios.CanceledError("Session changed");
    if (config.retriedAfterRefresh) {
      invalidateSession();
      throw error;
    }
    config.retriedAfterRefresh = true;
    // تمام درخواست‌های هم‌زمان این tab منتظر یک refresh می‌مانند؛ توکن در JavaScript خوانده نمی‌شود.
    // ممکن است 401 دیر برسد ولی درخواست دیگری قبلاً access را تمدید کرده باشد.
    if (config.accessVersion === accessVersion)
      refreshPromise ??= authClient
        .post(endpoints.auth.refresh)
        .then((response) => {
          accessVersion += 1;
          return response;
        })
        .catch((refreshError) => {
          if (
            axios.isAxiosError(refreshError) &&
            [401, 403].includes(refreshError.response?.status ?? 0)
          )
            invalidateSession();
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    await refreshPromise;
    if (
      signingOut ||
      config.sessionGeneration !== generation ||
      config.signal?.aborted
    )
      throw new axios.CanceledError("Session changed");
    return apiClient.request(config);
  },
);
