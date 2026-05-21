"use client";

import { useFlightStore } from "@/store/flight-store";
import { PassengerForm } from "@/components/booking/passenger-form";
import { BookingSummary } from "@/components/booking/booking-summary";

/**
 * Client component that reads from Zustand store to display
 * the booking form alongside the booking summary.
 */
export function BookingPageClient() {
  const { selectedFlight, selectedSeat } = useFlightStore();

  if (!selectedFlight || !selectedSeat) {
    return null; // PassengerForm handles the empty state
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
      {/* Passenger Form */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-6">
          Passenger Details
        </h2>
        <PassengerForm />
      </div>

      {/* Booking Summary Sidebar */}
      <div className="glass-card p-6 h-fit lg:sticky lg:top-24">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Booking Summary
        </h3>
        <BookingSummary flight={selectedFlight} seat={selectedSeat} />
      </div>
    </div>
  );
}
