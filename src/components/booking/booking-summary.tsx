import { formatCurrency, formatDate, formatTime } from "@/utils/format";
import { AIRPORTS, type AirportCode, SEAT_CLASS_LABELS, type SeatClass } from "@/utils/constants";
import type { Flight, Seat } from "@/types/database";

interface BookingSummaryProps {
  flight: Flight;
  seat: Seat;
}

export function BookingSummary({ flight, seat }: BookingSummaryProps) {
  const origin = AIRPORTS[flight.origin as AirportCode];
  const dest = AIRPORTS[flight.destination as AirportCode];
  const totalPrice = flight.base_price + seat.extra_fee;

  return (
    <div className="space-y-4">
      {/* Route */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">From</p>
          <p className="text-lg font-semibold text-white">
            {origin?.city ?? flight.origin}
          </p>
          <p className="text-xs text-slate-500">{flight.origin}</p>
        </div>
        <div className="flex items-center px-4">
          <div className="w-8 h-px bg-brand-500/50" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-brand-400 mx-1"
          >
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
          <div className="w-8 h-px bg-brand-500/50" />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">To</p>
          <p className="text-lg font-semibold text-white">
            {dest?.city ?? flight.destination}
          </p>
          <p className="text-xs text-slate-500">{flight.destination}</p>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500">Flight</p>
          <p className="text-white font-medium">{flight.flight_no}</p>
        </div>
        <div>
          <p className="text-slate-500">Date</p>
          <p className="text-white font-medium">{formatDate(flight.departs_at)}</p>
        </div>
        <div>
          <p className="text-slate-500">Departure</p>
          <p className="text-white font-medium">{formatTime(flight.departs_at)}</p>
        </div>
        <div>
          <p className="text-slate-500">Arrival</p>
          <p className="text-white font-medium">{formatTime(flight.arrives_at)}</p>
        </div>
        <div>
          <p className="text-slate-500">Seat</p>
          <p className="text-white font-medium">{seat.seat_number}</p>
        </div>
        <div>
          <p className="text-slate-500">Class</p>
          <p className="text-white font-medium">
            {SEAT_CLASS_LABELS[seat.class as SeatClass]}
          </p>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Pricing */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Base fare</span>
          <span className="text-slate-300">{formatCurrency(flight.base_price)}</span>
        </div>
        {seat.extra_fee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Seat upgrade ({seat.class})</span>
            <span className="text-slate-300">{formatCurrency(seat.extra_fee)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold pt-2 border-t border-white/5">
          <span className="text-white">Total</span>
          <span className="text-gradient">{formatCurrency(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
