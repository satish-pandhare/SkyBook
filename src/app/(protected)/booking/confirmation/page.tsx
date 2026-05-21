import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatCurrency } from "@/utils/format";
import { AIRPORTS, type AirportCode, SEAT_CLASS_LABELS, type SeatClass } from "@/utils/constants";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  description: "Your flight has been booked successfully.",
};

interface ConfirmationPageProps {
  searchParams: {
    pnr?: string;
    bookingId?: string;
  };
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const { pnr, bookingId } = searchParams;

  if (!pnr || !bookingId) {
    redirect("/flights");
  }

  const supabase = await createClient();

  // Fetch booking with flight and seat details
  const { data } = await supabase
    .from("bookings")
    .select("*, flight:flights(*), seat:seats(*)")
    .eq("id", bookingId)
    .single();

  const booking = data as unknown as {
    id: string;
    total_price: number;
    flight: {
      flight_no: string;
      origin: string;
      destination: string;
      departs_at: string;
      arrives_at: string;
      aircraft_type: string;
    } | null;
    seat: {
      seat_number: string;
      class: string;
    } | null;
  } | null;

  if (!booking || !booking.flight || !booking.seat) {
    redirect("/flights");
  }

  const flight = booking.flight;
  const seat = booking.seat;

  const originAirport = AIRPORTS[flight.origin as AirportCode];
  const destAirport = AIRPORTS[flight.destination as AirportCode];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      {/* Success animation */}
      <div className="text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-500/20 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-400"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-slate-400">
          Your flight has been booked successfully
        </p>
      </div>

      {/* PNR Card */}
      <div className="glass-card p-8 mb-6 text-center animate-slide-up" style={{ animationDelay: "100ms" }}>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
          Your PNR Code
        </p>
        <p className="text-4xl sm:text-5xl font-bold font-mono text-gradient tracking-[0.3em]">
          {pnr}
        </p>
        <p className="text-xs text-slate-600 mt-3">
          Save this code for check-in and managing your booking
        </p>
      </div>

      {/* Booking details */}
      <div className="glass-card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
        {/* Route */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-bold text-white">
              {originAirport?.city ?? flight.origin}
            </p>
            <p className="text-sm text-slate-500">{flight.origin}</p>
          </div>
          <div className="flex items-center px-4">
            <div className="w-12 h-px bg-brand-500/50" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-brand-400 mx-2"
            >
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
            <div className="w-12 h-px bg-brand-500/50" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {destAirport?.city ?? flight.destination}
            </p>
            <p className="text-sm text-slate-500">{flight.destination}</p>
          </div>
        </div>

        <div className="h-px bg-white/5 mb-6" />

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Flight</p>
            <p className="text-white font-medium">{flight.flight_no}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Date</p>
            <p className="text-white font-medium">
              {formatDate(flight.departs_at)}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Time</p>
            <p className="text-white font-medium">
              {formatTime(flight.departs_at)} – {formatTime(flight.arrives_at)}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Seat</p>
            <p className="text-white font-medium">{seat.seat_number}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Class</p>
            <p className="text-white font-medium">
              {SEAT_CLASS_LABELS[seat.class as SeatClass]}
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Status</p>
            <Badge variant="success">Confirmed</Badge>
          </div>
        </div>

        <div className="h-px bg-white/5 my-6" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 font-medium">Total Paid</span>
          <span className="text-2xl font-bold text-gradient">
            {formatCurrency(booking.total_price)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
        <Link href="/my-bookings" className="flex-1">
          <Button variant="primary" fullWidth size="lg">
            View My Bookings
          </Button>
        </Link>
        <Link href="/flights" className="flex-1">
          <Button variant="secondary" fullWidth size="lg">
            Search More Flights
          </Button>
        </Link>
      </div>
    </div>
  );
}
