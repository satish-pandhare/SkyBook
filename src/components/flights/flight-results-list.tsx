"use client";

import { FlightCard } from "@/components/flights/flight-card";
import type { Flight } from "@/types/database";

interface FlightResultsListProps {
  flights: Flight[];
  origin: string;
  destination: string;
  date: string;
}

export function FlightResultsList({
  flights,
  origin,
  destination,
  date,
}: FlightResultsListProps) {
  if (flights.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-800 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500"
          >
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No flights found
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          We couldn&apos;t find any flights from{" "}
          <span className="text-slate-300 font-medium">{origin}</span> to{" "}
          <span className="text-slate-300 font-medium">{destination}</span> on{" "}
          <span className="text-slate-300 font-medium">{date}</span>. Try
          different dates or routes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="text-white font-medium">{flights.length}</span>{" "}
          flight{flights.length !== 1 ? "s" : ""} found
        </p>
        <p className="text-xs text-slate-600">
          Prices include base fare only
        </p>
      </div>
      <div className="space-y-4">
        {flights.map((flight, index) => (
          <div
            key={flight.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
          >
            <FlightCard flight={flight} />
          </div>
        ))}
      </div>
    </div>
  );
}
