"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LockKeyhole, Loader2, UserRound, Watch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api/api-error";
import { useQueryClient } from "@tanstack/react-query";
import { sessionQueryKey } from "@/features/auth/use-admin-session";

const loginSchema = z.object({
  username: z.string().trim().min(1, "نام کاربری را وارد کنید."),

  password: z.string().min(1, "رمز عبور را وارد کنید."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      const session = await loginAdmin(values);
      await queryClient.cancelQueries({ queryKey: ["admin"] });
      queryClient.removeQueries({ queryKey: ["admin"] });
      queryClient.setQueryData(sessionQueryKey, session);
      router.replace("/admin/orders");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/60 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-muted/50 blur-3xl" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/5 lg:grid-cols-2">
        {/* این معرفی فقط در صفحهٔ ورود است؛ ستون جدا فرم را خواناتر می‌کند و در موبایل بالای فرم می‌آید. */}
        <aside className="relative flex flex-col justify-between bg-primary p-8 text-primary-foreground sm:p-12">
          <Watch className="mb-12 size-10 text-gold" strokeWidth={1} />
          <div className="mb-6 text-right">
            <p dir="ltr" className="text-xs tracking-[0.3em] text-gold">
              WATCH STORE
            </p>

            <h1 className="mt-6 text-3xl font-medium leading-relaxed">
              ورود به پنل مدیریت
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-8 text-primary-foreground/70">
              برای ورود به بخش مدیریت، نام کاربری و رمز عبور خود را وارد کنید.
            </p>
          </div>
        </aside>

        {/* فرم مستقل از بخش معرفی است تا خطا و وضعیت ارسال کنار ورودی‌ها دیده شوند. */}
        <div className="flex flex-col justify-center p-7 sm:p-12">
          <form
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium"
              >
                نام کاربری
              </label>

              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />

                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="نام کاربری"
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-background pr-11"
                  {...register("username")}
                />
              </div>

              {errors.username && (
                <p className="mt-2 text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                رمز عبور
              </label>

              <div className="relative">
                <LockKeyhole
                  className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />

                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="رمز عبور"
                  disabled={isSubmitting}
                  className="h-12 rounded-xl bg-background pr-11"
                  {...register("password")}
                />
              </div>

              {errors.password && (
                <p className="mt-2 text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div
                role="alert"
                className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {serverError}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                "ورود به پنل مدیریت"
              )}
            </Button>
          </form>

          <div className="mt-7 border-t border-border pt-6">
            <p className="text-center text-xs leading-6 text-muted-foreground">
              این بخش فقط برای کاربران مجاز پنل مدیریت قابل دسترسی است.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
