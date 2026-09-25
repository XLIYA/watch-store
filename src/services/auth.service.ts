import { endpoints } from "@/config/api";
import { apiClient, authClient, endSession } from "@/services/api/api-client";

export interface AdminLoginCredentials { username: string; password: string }
export interface AdminSession { user: { username: string; name: string; role: "admin" } }

export function removeLegacyTokens() {

  try {
    localStorage.removeItem("watch-store-admin-access-token");
    localStorage.removeItem("watch-store-admin-refresh-token");
  } catch {
    
  }
}

export async function loginAdmin(credentials: AdminLoginCredentials): Promise<AdminSession> {
  removeLegacyTokens();
  const { data } = await authClient.post<AdminSession>(endpoints.auth.login, credentials);
  return data;
}
export async function getAdminSession(signal?: AbortSignal): Promise<AdminSession> {
  const { data } = await apiClient.get<AdminSession>(endpoints.auth.session, { requiresAuth: true, signal });
  return data;
}
export const logoutAdmin = endSession;
