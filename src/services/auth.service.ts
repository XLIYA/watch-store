import { apiClient } from "@/services/api/api-client";

export interface AdminLoginCredentials {
    username: string;
    password: string;
}

export interface AdminLoginResponse {
    accessToken: string;
    refreshToken: string;
}

const ACCESS_TOKEN_KEY =
    "watch-store-admin-access-token";

const REFRESH_TOKEN_KEY =
    "watch-store-admin-refresh-token";

export async function loginAdmin(
    credentials: AdminLoginCredentials,
): Promise<AdminLoginResponse> {
    const response =
        await apiClient.post<AdminLoginResponse>(
            "/auth/login",
            credentials,
        );

    const {
        accessToken,
        refreshToken,
    } = response.data;

    if (
        !accessToken ||
        !refreshToken
    ) {
        throw new Error(
            "Authentication tokens were not returned by the server.",
        );
    }

    saveAdminTokens({
        accessToken,
        refreshToken,
    });

    return {
        accessToken,
        refreshToken,
    };
}

export function saveAdminTokens(
    tokens: AdminLoginResponse,
) {
    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }

    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        tokens.accessToken,
    );

    localStorage.setItem(
        REFRESH_TOKEN_KEY,
        tokens.refreshToken,
    );
}

export function getAdminAccessToken() {
    if (
        typeof window ===
        "undefined"
    ) {
        return null;
    }

    return localStorage.getItem(
        ACCESS_TOKEN_KEY,
    );
}

export function getAdminRefreshToken() {
    if (
        typeof window ===
        "undefined"
    ) {
        return null;
    }

    return localStorage.getItem(
        REFRESH_TOKEN_KEY,
    );
}

export function clearAdminTokens() {
    if (
        typeof window ===
        "undefined"
    ) {
        return;
    }

    localStorage.removeItem(
        ACCESS_TOKEN_KEY,
    );

    localStorage.removeItem(
        REFRESH_TOKEN_KEY,
    );
}

export function hasAdminSession() {
    return Boolean(
        getAdminAccessToken(),
    );
}