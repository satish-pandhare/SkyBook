"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase client for use in Client Components.
 *
 * This client uses the anon key and handles auth cookies via the browser.
 * Use this for:
 * - Real-time subscriptions (e.g., seat updates)
 * - Client-side interactive features
 * - Reading public data from client components
 *
 * NEVER use this for privileged operations — use Server Actions instead.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
