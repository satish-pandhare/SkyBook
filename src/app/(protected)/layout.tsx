import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Protected layout — wraps all authenticated routes.
 *
 * This layout checks for an active user session server-side.
 * If no session exists, it redirects to /login.
 *
 * Note: Middleware also handles this, but this layout provides
 * a second layer of defense (defense-in-depth).
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
