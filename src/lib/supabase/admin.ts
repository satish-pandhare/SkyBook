import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase admin client with the SERVICE_ROLE_KEY.
 *
 * ⚠️ WARNING: This bypasses RLS completely.
 *
 * ONLY use this for:
 * - Server-side privileged operations that need to bypass RLS
 * - Background jobs or admin tasks
 * - Operations where RLS would prevent necessary cross-user access
 *
 * NEVER import this file from a Client Component or any file marked 'use client'.
 * The SERVICE_ROLE_KEY must never reach the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. " +
        "This client can only be used server-side."
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
