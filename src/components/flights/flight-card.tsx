"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFlightStore } from "@/store/flight-store";
import { formatTime, formatDuration, formatCurrency } from "@/utils/format";
import { AIRPORTS, type AirportCode } from "@/utils/constants";
import type { Flight } from "@/types/database";

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const router = useRouter();
  const selectFlight = useFlightStore((s) => s.selectFlight);

  const originAirport = AIRPORTS[flight.origin as AirportCode];
  const destAirport = AIRPORTS[flight.destination as AirportCode];
  const duration = formatDuration(flight.departs_at, flight.arrives_at);

  const handleSelect = () => {
    selectFlight(flight);
    router.push(`/flights/${flight.id}/seats`);
  };

  const statusBadge = flight.status === "delayed" ? (
    <Badge variant="warning">Delayed</Badge>
  ) : (
    <Badge variant="success">On Time</Badge>
  );

  return (
    <Card variant="interactive" className="group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Route info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-slate-500 bg-surface-800 px-2 py-1 rounded-lg">
              {flight.flight_no}
            </span>
            {statusBadge}
            <span className="text-xs text-slate-600">{flight.aircraft_type}</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Departure */}
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {formatTime(flight.departs_at)}
              </p>
              <p className="text-sm font-medium text-slate-300 mt-0.5">
                {flight.origin}
              </p>
              <p className="text-xs text-slate-500">
                {originAirport?.city ?? flight.origin}
              </p>
            </div>

            {/* Duration line */}
            <div className="flex-1 flex flex-col items-center gap-1 min-w-[80px]">
              <span className="text-xs text-slate-500">{duration}</span>
              <div className="relative w-full flex items-center">
                <div className="flex-1 h-px bg-gradient-to-r from-brand-500/50 via-brand-400 to-brand-500/50" />
                <div className="mx-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-brand-400"
                  >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                  </svg>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-brand-500/50 via-brand-400 to-brand-500/50" />
              </div>
              <span className="text-[10px] text-slate-600">Non-stop</span>
            </div>

            {/* Arrival */}
            <div className="text-center sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {formatTime(flight.arrives_at)}
              </p>
              <p className="text-sm font-medium text-slate-300 mt-0.5">
                {flight.destination}
              </p>
              <p className="text-xs text-slate-500">
                {destAirport?.city ?? flight.destination}
              </p>
            </div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 lg:gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/5 lg:pl-8">
          <div className="text-right">
            <p className="text-xs text-slate-500">Starting from</p>
            <p className="text-2xl font-bold text-gradient">
              {formatCurrency(flight.base_price)}
            </p>
          </div>
          <Button
            onClick={handleSelect}
            variant="primary"
            size="md"
            className="whitespace-nowrap"
          >
            Select Seats
          </Button>
        </div>
      </div>
    </Card>
  );
}
