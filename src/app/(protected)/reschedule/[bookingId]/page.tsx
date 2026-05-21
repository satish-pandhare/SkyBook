import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RescheduleClient } from "@/components/booking/reschedule-client";
import { formatDate, formatTime } from "@/utils/format";
import { AIRPORTS, type AirportCode } from "@/utils/constants";

export const metadata: Metadata = {
  title: "Reschedule Booking",
  description: "Reschedule your flight to a different date or time.",
};

interface ReschedulePageProps {
  params: { bookingId: string };
}

export default async function ReschedulePage({ params }: ReschedulePageProps) {
  const supabase = await createClient();

  // Fetch the existing booking with flight details
  const { data, error } = await supabase
    .from("bookings")
    .select("*, flight:flights(*), seat:seats(*)")
    .eq("id", params.bookingId)
    .eq("status", "confirmed")
    .single();

  const booking = data as unknown as {
    pnr_code: string;
    flight: {
      id: string;
      flight_no: string;
      origin: string;
      destination: string;
      departs_at: string;
      arrives_at: string;
    } | null;
  } | null;

  if (error || !booking || !booking.flight) {
    redirect("/my-bookings");
  }

  const flight = booking.flight;

  const origin = AIRPORTS[flight.origin as AirportCode];
  const dest = AIRPORTS[flight.destination as AirportCode];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Reschedule Booking
        </h1>
        <p className="text-slate-500">
          PNR: <span className="text-brand-400 font-mono">{booking.pnr_code}</span>
        </p>
      </div>

      {/* Current booking info */}
      <div className="glass-card p-6 mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Current Booking
        </h3>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-lg font-bold text-white">
              {origin?.city ?? flight.origin}
            </p>
            <p className="text-xs text-slate-500">{formatTime(flight.departs_at)}</p>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-px bg-slate-600" />
            <span className="text-xs text-slate-500 mx-2">{flight.flight_no}</span>
            <div className="w-6 h-px bg-slate-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {dest?.city ?? flight.destination}
            </p>
            <p className="text-xs text-slate-500">{formatTime(flight.arrives_at)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-500">Date</p>
            <p className="text-sm text-white">{formatDate(flight.departs_at)}</p>
          </div>
        </div>
      </div>

      {/* Reschedule flow */}
      <RescheduleClient
        bookingId={params.bookingId}
        currentFlightId={flight.id}
        currentOrigin={flight.origin}
        currentDestination={flight.destination}
      />
    </div>
  );
}
