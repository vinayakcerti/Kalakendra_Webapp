import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

async function fetchAdminMe(): Promise<AdminUser | null> {
  const res = await fetch(`/api/admin/me`, {
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
  const queryClient = useQueryClient();

  // When Chrome restores a page from bfcache (back/forward navigation),
  // React doesn't re-run — force a session re-check so logged-out users
  // can't see the dashboard by pressing Back.
  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) {
        void queryClient.invalidateQueries({ queryKey: ["admin-me"] });
      }
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, [queryClient]);

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
