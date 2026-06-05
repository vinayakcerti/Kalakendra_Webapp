import { useQuery } from "@tanstack/react-query";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

async function fetchAdminMe(): Promise<AdminUser | null> {
  const res = await fetch(`${(import.meta.env.VITE_API_URL ?? "")}/api/admin/me`, {
    credentials: "include",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to check admin session");
  const data = (await res.json()) as { admin: AdminUser };
  return data.admin;
}

/**
 * Returns the currently logged-in admin (null if not authenticated).
 * Uses a 60-second stale time to avoid hammering the API.
 */
export function useAdminAuth() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-me"],
    queryFn: fetchAdminMe,
    staleTime: 60_000,
    retry: false,
  });

  return {
    admin: data ?? null,
    isLoading,
    isAuthenticated: data != null,
  };
}
