import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

/*
 * هدف:
 * ساخت Axios Client مشترک برای تمام درخواست‌های API پروژه.
 *
 * محل استفاده:
 * تمام Serviceهای پروژه مثل products.service، orders.service و Upload Serviceها.
 *
 * نحوه کار:
 * فقط Header عمومی Accept به‌صورت ثابت تنظیم می‌شود.
 * Content-Type عمداً ثابت نشده تا Axios بر اساس نوع Body آن را تعیین کند:
 *
 * Object / JSON  -> application/json
 * FormData       -> multipart/form-data همراه boundary صحیح
 *
 * در نتیجه همین apiClient هم برای درخواست‌های معمولی JSON
 * و هم برای Upload فایل قابل استفاده است.
 */
export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,

  headers: {
    Accept: "application/json",
  },
});