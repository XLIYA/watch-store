import { NextResponse, type NextRequest } from "next/server";
import { apiConfig, endpoints } from "@/config/api";
import cookies from "../shared/auth-cookies.json";

/** پیش از رندر پنل، خود Backend امضا، انقضا، نشست فعال و نقش را بررسی می‌کند؛ decode کردن JWT مجوز نیست. */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/admin/login" || path === "/admin/login/") return NextResponse.next();
  const recovery = new URL("/auth/admin-session", request.url);
  recovery.searchParams.set("next", path + request.nextUrl.search);
  const token = request.cookies.get(cookies.access)?.value;
  // refresh با Path=/auth عمداً در این درخواست موجود نیست؛ بازیابی در مرورگر از کلاینت مشترک استفاده می‌کند.
  if (!token) return NextResponse.redirect(recovery);
  try {
    const session = await fetch(apiConfig.baseURL + endpoints.auth.session, {
      headers: { Cookie: `${cookies.access}=${token}`, Accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(apiConfig.timeout),
    });
    if (session.status === 401) return NextResponse.redirect(recovery);
    if (session.status === 403) return NextResponse.redirect(new URL("/admin/login", request.url));
    if (!session.ok) throw new Error("Session unavailable");
    const data = await session.json();
    if (data.user?.role !== "admin") return NextResponse.redirect(new URL("/admin/login", request.url));
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    // خطای سرور خروج از حساب نیست؛ پاسخ بسته می‌ماند و کوکی‌ها حفظ می‌شوند تا با بارگذاری دوباره قابل تلاش باشد.
    return new NextResponse("ارتباط با سرور ورود برقرار نشد. لطفاً صفحه را دوباره بارگذاری کنید.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "5" } });
  }
}

export const config = { matcher: ["/admin/:path*"] };
