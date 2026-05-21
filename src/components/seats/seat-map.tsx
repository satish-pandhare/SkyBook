"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSeats } from "@/hooks/use-realtime-seats";
import { SeatClassSection } from "@/components/seats/seat-class-section";
import { SeatLegend } from "@/components/seats/seat-legend";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFlightStore } from "@/store/flight-store";
import { formatCurrency } from "@/utils/format";
import type { Seat } from "@/types/database";
import type { SeatClass } from "@/utils/constants";

interface SeatMapProps {
  flightId: string;
  basePrice: number;
  userSeatIds?: string[];
}

/**
 * Full interactive seat map with real-time updates.
 * Groups seats by class and renders them with proper layout.
 */
export function SeatMap({ flightId, basePrice, userSeatIds = [] }: SeatMapProps) {
  const router = useRouter();
  const { seats, isLoading, error } = useRealtimeSeats(flightId);
  const { selectedSeat, selectSeat, rollbackSeatSelection, setBookingStep } =
    useFlightStore();

  // Group seats by class
  const seatsByClass = useMemo(() => {
    const groups: Record<SeatClass, Seat[]> = {
      first: [],
      business: [],
      economy: [],
    };

    seats.forEach((seat) => {
      const seatClass = seat.class as SeatClass;
      if (groups[seatClass]) {
        groups[seatClass].push(seat);
      }
    });

    return groups;
  }, [seats]);

  // Handle optimistic rollback when a selected seat gets taken by another user
  useEffect(() => {
    if (selectedSeat) {
      const currentSeat = seats.find((s) => s.id === selectedSeat.id);
      if (currentSeat && !currentSeat.is_available) {
        // Another user took this seat — rollback
        rollbackSeatSelection();
      }
    }
  }, [seats, selectedSeat, rollbackSeatSelection]);

  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeat?.id === seat.id) {
      // Deselect
      rollbackSeatSelection();
    } else {
      selectSeat(seat);
    }
  };

  const handleContinue = () => {
    if (selectedSeat) {
      setBookingStep("passenger");
      router.push(`/booking?flightId=${flightId}&seatId=${selectedSeat.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Loading seat map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-400 mb-2">Failed to load seats</p>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  const selectedPrice = selectedSeat
    ? basePrice + selectedSeat.extra_fee
    : null;

  return (
    <div className="space-y-8">
      {/* Legend */}
      <SeatLegend />

      {/* Seat map container — horizontally scrollable on mobile */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[340px] space-y-8 px-2">
          {/* Cockpit indicator */}
          <div className="flex justify-center">
            <div className="w-24 h-8 rounded-t-[50%] bg-surface-800/50 border border-white/5 border-b-0 flex items-center justify-center">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">
                Front
              </span>
            </div>
          </div>

          {/* First Class */}
          {seatsByClass.first.length > 0 && (
            <SeatClassSection
              seatClass="first"
              seats={seatsByClass.first}
              selectedSeatId={selectedSeat?.id ?? null}
              userSeatIds={userSeatIds}
              onSelect={handleSeatSelect}
              basePrice={basePrice}
            />
          )}

          {/* Divider */}
          {seatsByClass.first.length > 0 && seatsByClass.business.length > 0 && (
            <div className="flex items-center gap-3 px-8">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">
                Cabin Divider
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          )}

          {/* Business */}
          {seatsByClass.business.length > 0 && (
            <SeatClassSection
              seatClass="business"
              seats={seatsByClass.business}
              selectedSeatId={selectedSeat?.id ?? null}
              userSeatIds={userSeatIds}
              onSelect={handleSeatSelect}
              basePrice={basePrice}
            />
          )}

          {/* Divider */}
          {seatsByClass.business.length > 0 && seatsByClass.economy.length > 0 && (
            <div className="flex items-center gap-3 px-8">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">
                Cabin Divider
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          )}

          {/* Economy */}
          {seatsByClass.economy.length > 0 && (
            <SeatClassSection
              seatClass="economy"
              seats={seatsByClass.economy}
              selectedSeatId={selectedSeat?.id ?? null}
              userSeatIds={userSeatIds}
              onSelect={handleSeatSelect}
              basePrice={basePrice}
            />
          )}

          {/* Tail indicator */}
          <div className="flex justify-center">
            <div className="w-16 h-6 rounded-b-[50%] bg-surface-800/50 border border-white/5 border-t-0 flex items-center justify-center">
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">
                Rear
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected seat summary & continue */}
      <div className="sticky bottom-0 bg-surface/95 backdrop-blur-lg border-t border-white/5 -mx-6 -mb-6 px-6 py-4 sm:-mx-8 sm:-mb-8 sm:px-8 rounded-b-2xl">
        {selectedSeat ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">
                Seat{" "}
                <span className="text-white font-semibold">
                  {selectedSeat.seat_number}
                </span>{" "}
                <span className="text-slate-500">
                  ({selectedSeat.class})
                </span>
              </p>
              <p className="text-lg font-bold text-gradient">
                {selectedPrice !== null ? formatCurrency(selectedPrice) : ""}
              </p>
            </div>
            <Button onClick={handleContinue} variant="accent" size="lg">
              Continue to Booking
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-1">
            Select a seat to continue
          </p>
        )}
      </div>
    </div>
  );
}
