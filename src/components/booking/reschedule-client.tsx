"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { rescheduleBooking } from "@/lib/actions/reschedule";
import { SeatMap } from "@/components/seats/seat-map";
import { FlightCard } from "@/components/flights/flight-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFlightStore } from "@/store/flight-store";
import { formatCurrency } from "@/utils/format";
import { RESCHEDULE_FEE } from "@/utils/constants";
import type { Flight } from "@/types/database";

interface RescheduleClientProps {
  bookingId: string;
  currentFlightId: string;
  currentOrigin: string;
  currentDestination: string;
}

type RescheduleStep = "select-flight" | "select-seat" | "confirm";

export function RescheduleClient({
  bookingId,
  currentFlightId,
  currentOrigin,
  currentDestination,
}: RescheduleClientProps) {
  const router = useRouter();
  const { selectedSeat } = useFlightStore();

  const [step, setStep] = useState<RescheduleStep>("select-flight");
  const [alternativeFlights, setAlternativeFlights] = useState<Flight[]>([]);
  const [selectedNewFlight, setSelectedNewFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch alternative flights on the same route
  useEffect(() => {
    const fetchFlights = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("flights")
        .select("*")
        .eq("origin", currentOrigin)
        .eq("destination", currentDestination)
        .neq("id", currentFlightId)
        .in("status", ["scheduled", "delayed"])
        .gt("departs_at", new Date().toISOString())
        .order("departs_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAlternativeFlights(data ?? []);
      }
      setIsLoading(false);
    };

    fetchFlights();
  }, [currentFlightId, currentOrigin, currentDestination]);

  const handleFlightSelect = (flight: Flight) => {
    setSelectedNewFlight(flight);
    setStep("select-seat");
  };

  const handleConfirmReschedule = async () => {
    if (!selectedNewFlight || !selectedSeat) return;

    setIsSubmitting(true);
    setError("");

    const result = await rescheduleBooking(
      bookingId,
      selectedNewFlight.id,
      selectedSeat.id
    );

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    // Navigate to confirmation
    router.push(
      `/booking/confirmation?pnr=${result.newPnrCode}&bookingId=${result.newBookingId}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Finding alternative flights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-3 text-sm">
        {(["select-flight", "select-seat", "confirm"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            {i > 0 && <div className="w-8 h-px bg-white/10" />}
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border ${
                  step === s
                    ? "bg-brand-500 border-brand-400 text-white"
                    : i < ["select-flight", "select-seat", "confirm"].indexOf(step)
                    ? "bg-accent-500/20 border-accent-500/30 text-accent-400"
                    : "bg-surface-800 border-white/10 text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`hidden sm:inline ${
                  step === s ? "text-white" : "text-slate-500"
                }`}
              >
                {s === "select-flight"
                  ? "New Flight"
                  : s === "select-seat"
                  ? "New Seat"
                  : "Confirm"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Select new flight */}
      {step === "select-flight" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            Select a new flight
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Showing alternative flights on the same route. A reschedule fee of{" "}
            <span className="text-white font-medium">
              {formatCurrency(RESCHEDULE_FEE)}
            </span>{" "}
            will apply.
          </p>

          {alternativeFlights.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-400">
                No alternative flights available on this route.
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push("/my-bookings")}
                className="mt-4"
              >
                Back to Bookings
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alternativeFlights.map((flight) => (
                <div
                  key={flight.id}
                  onClick={() => handleFlightSelect(flight)}
                  className="cursor-pointer"
                >
                  <FlightCard flight={flight} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select seat on new flight */}
      {step === "select-seat" && selectedNewFlight && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Select a seat on {selectedNewFlight.flight_no}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("select-flight");
                setSelectedNewFlight(null);
              }}
            >
              ← Change flight
            </Button>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <SeatMap
              flightId={selectedNewFlight.id}
              basePrice={selectedNewFlight.base_price}
            />
          </div>

          {selectedSeat && (
            <div className="flex justify-end">
              <Button
                variant="accent"
                size="lg"
                onClick={() => setStep("confirm")}
              >
                Review Reschedule
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === "confirm" && selectedNewFlight && selectedSeat && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">
            Confirm Reschedule
          </h2>

          <div className="glass-card p-6">
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-slate-500 mb-1">New Flight</p>
                <p className="text-white font-medium">
                  {selectedNewFlight.flight_no}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">New Seat</p>
                <p className="text-white font-medium">
                  {selectedSeat.seat_number} ({selectedSeat.class})
                </p>
              </div>
            </div>

            <div className="h-px bg-white/5 my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">New flight fare</span>
                <span className="text-slate-300">
                  {formatCurrency(selectedNewFlight.base_price)}
                </span>
              </div>
              {selectedSeat.extra_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Seat upgrade</span>
                  <span className="text-slate-300">
                    {formatCurrency(selectedSeat.extra_fee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Reschedule fee</span>
                <span className="text-amber-400">
                  {formatCurrency(RESCHEDULE_FEE)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5 text-base font-semibold">
                <span className="text-white">Total</span>
                <span className="text-gradient">
                  {formatCurrency(
                    selectedNewFlight.base_price +
                      selectedSeat.extra_fee +
                      RESCHEDULE_FEE
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            Your current booking will be marked as rescheduled and a new booking
            with a new PNR will be created.
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep("select-seat")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              variant="accent"
              size="lg"
              onClick={handleConfirmReschedule}
              isLoading={isSubmitting}
              className="flex-1"
            >
              Confirm Reschedule
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
