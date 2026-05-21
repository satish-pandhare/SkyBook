import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SeatMap } from "@/components/seats/seat-map";
import { formatDate, formatTime, formatCurrency } from "@/utils/format";
import { AIRPORTS, type AirportCode } from "@/utils/constants";
import type { Metadata } from "next";
import type { Flight } from "@/types/database";

interface SeatSelectionPageProps {
  params: { flightId: string };
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Select Your Seat",
    description: "Choose your preferred seat with our interactive seat map.",
  };
}

export default async function SeatSelectionPage({
  params,
}: SeatSelectionPageProps) {
  const supabase = await createClient();

  // Fetch flight details
  const { data: flightData, error } = await supabase
    .from("flights")
    .select("*")
    .eq("id", params.flightId)
    .single();

  if (error || !flightData) {
    redirect("/flights");
  }

  const flight = flightData as unknown as Flight;

  // Get current user's booked seat IDs on this flight
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userSeatIds: string[] = [];
  if (user) {
    const { data: userBookings } = await supabase
      .from("bookings")
      .select("seat_id")
      .eq("flight_id", params.flightId)
      .eq("user_id", user.id)
      .eq("status", "confirmed");

    userSeatIds = (userBookings as unknown as { seat_id: string }[])?.map((b) => b.seat_id) ?? [];
  }

  const originAirport = AIRPORTS[flight.origin as AirportCode];
  const destAirport = AIRPORTS[flight.destination as AirportCode];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Flight info header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-slate-500 bg-surface-800 px-2 py-1 rounded-lg">
                {flight.flight_no}
              </span>
              <span className="text-xs text-slate-500">
                {flight.aircraft_type}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {originAirport?.city ?? flight.origin}{" "}
              <span className="text-brand-400">→</span>{" "}
              {destAirport?.city ?? flight.destination}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {formatDate(flight.departs_at)} · {formatTime(flight.departs_at)} –{" "}
              {formatTime(flight.arrives_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">From</p>
            <p className="text-xl font-bold text-gradient">
              {formatCurrency(flight.base_price)}
            </p>
          </div>
        </div>
      </div>

      {/* Seat map */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-6">
          Select Your Seat
        </h2>
        <SeatMap
          flightId={params.flightId}
          basePrice={flight.base_price}
          userSeatIds={userSeatIds}
        />
      </div>
    </div>
  );
}
