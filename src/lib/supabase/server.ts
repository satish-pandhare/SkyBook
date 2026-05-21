import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers.
 *
 * This client reads/writes auth cookies server-side to maintain the user session.
 * Uses the anon key — RLS policies are enforced based on auth.uid().
 *
 * Use this for:
 * - Server Components (data fetching)
 * - Server Actions (mutations with RLS)
 * - Route Handlers
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component (read-only context).
            // This is safe to ignore when middleware handles session refresh.
          }
        },
      },
    }
  );
}
