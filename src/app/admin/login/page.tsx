"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LockKeyhole, Loader2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAdmin } from "@/services/auth.service";

const loginSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "نام کاربری را وارد کنید."),

    password: z
        .string()
        .min(1, "رمز عبور را وارد کنید."),
});

type LoginFormValues =
    z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
    const router = useRouter();

    const [serverError, setServerError] =
        useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),

        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (
        values: LoginFormValues,
    ) => {
        setServerError(null);

        try {
            await loginAdmin(values);

            router.replace("/admin");
        } catch (error) {
            console.error(
                "Admin login failed:",
                error,
            );

            setServerError(
                "نام کاربری یا رمز عبور صحیح نیست.",
            );
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary/60 blur-3xl" />

                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-muted/50 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Brand */}
                <div className="mb-10 text-center">
                    <p
                        dir="ltr"
                        className="section-eyebrow"
                    >
                        WATCH STORE
                    </p>

                    <h1 className="mt-3 text-3xl font-medium">
                        ورود به پنل مدیریت
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        برای ورود به بخش مدیریت،
                        نام کاربری و رمز عبور خود
                        را وارد کنید.
                    </p>
                </div>

                {/* Login Box */}
                <div className="border border-border bg-background p-7 sm:p-9">
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(
                            onSubmit,
                        )}
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
                                    disabled={
                                        isSubmitting
                                    }
                                    className="h-12 rounded-none pr-11"
                                    {...register(
                                        "username",
                                    )}
                                />
                            </div>

                            {errors.username && (
                                <p className="mt-2 text-xs text-destructive">
                                    {
                                        errors
                                            .username
                                            .message
                                    }
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
                                    disabled={
                                        isSubmitting
                                    }
                                    className="h-12 rounded-none pr-11"
                                    {...register(
                                        "password",
                                    )}
                                />
                            </div>

                            {errors.password && (
                                <p className="mt-2 text-xs text-destructive">
                                    {
                                        errors
                                            .password
                                            .message
                                    }
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
                            className="h-12 w-full rounded-none"
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
                            این بخش فقط برای
                            کاربران مجاز پنل مدیریت
                            قابل دسترسی است.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}