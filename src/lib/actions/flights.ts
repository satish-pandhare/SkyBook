"use server";

import { createClient } from "@/lib/supabase/server";
import { searchSchema } from "@/lib/validators/search";
import type { Flight } from "@/types/database";

interface SearchResult {
  flights?: Flight[];
  error?: string;
}

/**
 * Search for flights by origin, destination, and date.
 * Runs server-side with RLS enforced via the user's session.
 */
export async function searchFlights(formData: FormData): Promise<SearchResult> {
  const raw = {
    origin: formData.get("origin") as string,
    destination: formData.get("destination") as string,
    date: formData.get("date") as string,
  };

  const parsed = searchSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { origin, destination, date } = parsed.data;

  const supabase = await createClient();

  // Search for flights on the given date (full day range)
  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("origin", origin)
    .eq("destination", destination)
    .gte("departs_at", startOfDay)
    .lte("departs_at", endOfDay)
    .in("status", ["scheduled", "delayed"])
    .order("departs_at", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { flights: data ?? [] };
}

/**
 * Get a single flight by ID.
 */
export async function getFlightById(flightId: string): Promise<{ flight?: Flight; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("id", flightId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { flight: data };
}
