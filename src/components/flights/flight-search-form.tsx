"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AIRPORT_OPTIONS } from "@/utils/constants";
import { useFlightStore } from "@/store/flight-store";
import { toDateInputValue } from "@/utils/format";

export function FlightSearchForm() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useFlightStore();

  const [origin, setOrigin] = useState(searchQuery?.origin ?? "");
  const [destination, setDestination] = useState(searchQuery?.destination ?? "");
  const [date, setDate] = useState(searchQuery?.date ?? toDateInputValue(new Date()));
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!origin) {
      setError("Please select an origin airport");
      return;
    }
    if (!destination) {
      setError("Please select a destination airport");
      return;
    }
    if (origin === destination) {
      setError("Origin and destination must be different");
      return;
    }
    if (!date) {
      setError("Please select a travel date");
      return;
    }

    setSearchQuery({ origin, destination, date });
    router.push(`/flights?origin=${origin}&destination=${destination}&date=${date}`);
  };

  // Swap origin and destination
  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        {/* Origin */}
        <Select
          label="From"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          options={AIRPORT_OPTIONS}
          placeholder="Select origin"
        />

        {/* Swap button */}
        <button
          type="button"
          onClick={handleSwap}
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-surface-700 hover:bg-surface-600 border border-white/10 text-slate-400 hover:text-white transition-all duration-200 mb-0.5"
          aria-label="Swap origin and destination"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3 4 7l4 4" />
            <path d="M4 7h16" />
            <path d="m16 21 4-4-4-4" />
            <path d="M20 17H4" />
          </svg>
        </button>

        {/* Destination */}
        <Select
          label="To"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          options={AIRPORT_OPTIONS}
          placeholder="Select destination"
        />
      </div>

      {/* Date */}
      <div className="max-w-xs">
        <Input
          type="date"
          label="Travel Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={toDateInputValue(new Date())}
        />
      </div>

      {/* Submit */}
      <Button type="submit" size="lg" fullWidth>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        Search Flights
      </Button>
    </form>
  );
}
