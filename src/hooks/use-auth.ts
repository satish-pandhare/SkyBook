"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user-store";

/**
 * Hook to sync Supabase auth state with Zustand store.
 *
 * Call this once in the root layout or a top-level client component
 * to keep the user store in sync with auth changes (login/logout/token refresh).
 */
export function useAuth() {
  const router = useRouter();
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const supabase = createClient();

    // Check initial session
    const initSession = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || "" });
      }
    };

    initSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
      } else {
        clearUser();
      }
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, clearUser, router]);

  return { user };
}
