"use client";

import { useAuth } from "@/hooks/use-auth";

/**
 * Client-side auth provider that syncs Supabase auth state
 * with the Zustand user store. Place this in the root layout.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}
