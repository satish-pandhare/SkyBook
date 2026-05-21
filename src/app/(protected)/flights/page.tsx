import type { Metadata } from "next";
import { Suspense } from "react";
import { FlightSearchForm } from "@/components/flights/flight-search-form";
import { FlightResultsList } from "@/components/flights/flight-results-list";
import { createClient } from "@/lib/supabase/server";
import type { Flight } from "@/types/database";
import { AIRPORTS, type AirportCode } from "@/utils/constants";

export const metadata: Metadata = {
  title: "Search Flights",
  description: "Search for available flights across multiple routes.",
};

interface FlightsPageProps {
  searchParams: {
    origin?: string;
    destination?: string;
    date?: string;
  };
}

/**
 * Fetch flights server-side based on search params.
 * Returns empty array if no search params are provided.
 */
async function fetchFlights(
  origin?: string,
  destination?: string,
  date?: string
): Promise<Flight[]> {
  if (!origin || !destination || !date) return [];

  const supabase = await createClient();

  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data } = await supabase
    .from("flights")
    .select("*")
    .eq("origin", origin)
    .eq("destination", destination)
    .gte("departs_at", startOfDay)
    .lte("departs_at", endOfDay)
    .in("status", ["scheduled", "delayed"])
    .order("departs_at", { ascending: true });

  return data ?? [];
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const { origin, destination, date } = searchParams;
  const hasSearch = origin && destination && date;
  const flights = await fetchFlights(origin, destination, date);

  const originCity = origin ? AIRPORTS[origin as AirportCode]?.city : "";
  const destCity = destination ? AIRPORTS[destination as AirportCode]?.city : "";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          {hasSearch ? (
            <>
              {originCity || origin}{" "}
              <span className="text-brand-400">→</span>{" "}
              {destCity || destination}
            </>
          ) : (
            "Search Flights"
          )}
        </h1>
        <p className="text-slate-500">
          {hasSearch
            ? `Showing results for ${date}`
            : "Find the perfect flight for your journey"}
        </p>
      </div>

      {/* Search Form */}
      <div className="glass-card p-6 sm:p-8 mb-8">
        <Suspense fallback={<div className="h-40 shimmer rounded-xl" />}>
          <FlightSearchForm />
        </Suspense>
      </div>

      {/* Results */}
      {hasSearch && (
        <FlightResultsList
          flights={flights}
          origin={originCity || origin}
          destination={destCity || destination}
          date={date}
        />
      )}
    </div>
  );
}
