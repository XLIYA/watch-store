import axios from "axios";

export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

// پیام فنی backend به کاربر نمایش داده نمی‌شود؛ خطای شبکه با رمز اشتباه یا 404 تفاوت دارد.
export function getApiErrorMessage(error: unknown): string {
  if (axios.isCancel(error)) return "درخواست لغو شد.";
  if (axios.isAxiosError(error)) {
    if (!error.response)
      return "ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.";
    if (error.response.data?.code === "INVALID_PRODUCT" && typeof error.response.data.message === "string") return error.response.data.message;
    if (error.response.data?.code === "INVALID_CREDENTIALS")
      return "نام کاربری یا رمز عبور صحیح نیست.";
    switch (error.response.status) {
      case 401:
        return "نشست شما پایان یافته است. دوباره وارد شوید.";
      case 403:
        return "اجازهٔ انجام این عملیات را ندارید.";
      case 404:
        return "اطلاعات درخواستی پیدا نشد.";
      case 400:
      case 422:
        return "اطلاعات ارسال‌شده معتبر نیست.";
      case 429:
        return "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.";
    }
  }
  return "دریافت یا ذخیرهٔ اطلاعات با خطا مواجه شد. دوباره تلاش کنید.";
}

export function shouldRetryQuery(failureCount: number, error: unknown) {
  const status = getErrorStatus(error);
  return (
    !axios.isCancel(error) &&
    failureCount < 1 &&
    (status === undefined || status >= 500)
  );
}
