"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFlightStore } from "@/store/flight-store";
import { createBooking } from "@/lib/actions/booking";
import { passengerSchema } from "@/lib/validators/passenger";

export function PassengerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedFlight,
    selectedSeat,
    passengerData,
    setPassengerData,
    setSensitiveData,
    setBookingStep,
    reset,
  } = useFlightStore();

  // Use URL params as primary source, fall back to store
  const flightId = searchParams.get("flightId") || selectedFlight?.id || "";
  const seatId = searchParams.get("seatId") || selectedSeat?.id || "";

  const [fullName, setFullName] = useState(passengerData?.fullName ?? "");
  const [passportNo, setPassportNo] = useState("");
  const [nationality, setNationality] = useState(passengerData?.nationality ?? "");
  const [dob, setDob] = useState(passengerData?.dob ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!selectedFlight || !selectedSeat) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400 mb-4">No flight or seat selected.</p>
        <Button onClick={() => router.push("/flights")} variant="secondary">
          Search Flights
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");

    // Validate with Zod
    const parsed = passengerSchema.safeParse({
      fullName,
      passportNo: passportNo.toUpperCase(),
      nationality,
      dob,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Validate that we have valid IDs before submitting
    if (!flightId || !seatId) {
      setSubmitError("Flight or seat selection was lost. Please go back and select again.");
      return;
    }

    // Save non-sensitive data to store (persisted)
    setPassengerData({ fullName, nationality, dob });
    // Save sensitive data to store (NOT persisted)
    setSensitiveData({ passportNo: passportNo.toUpperCase() });

    setIsLoading(true);

    // Submit booking via Server Action — use URL params as source of truth
    const formData = new FormData();
    formData.set("flightId", flightId);
    formData.set("seatId", seatId);
    formData.set("fullName", fullName);
    formData.set("passportNo", passportNo.toUpperCase());
    formData.set("nationality", nationality);
    formData.set("dob", dob);

    const result = await createBooking(formData);

    if (result.error) {
      setSubmitError(result.error);
      setIsLoading(false);
      return;
    }

    // Success — navigate to confirmation
    setBookingStep("confirmation");
    reset();
    router.push(
      `/booking/confirmation?pnr=${result.pnrCode}&bookingId=${result.bookingId}`
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {submitError}
        </div>
      )}

      <Input
        label="Full Name (as on passport)"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={errors.fullName}
        placeholder="John Doe"
        required
      />

      <Input
        label="Passport Number"
        value={passportNo}
        onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
        error={errors.passportNo}
        placeholder="A12345678"
        required
        autoComplete="off"
        hint="This will not be saved locally for security"
      />

      <Input
        label="Nationality"
        value={nationality}
        onChange={(e) => setNationality(e.target.value)}
        error={errors.nationality}
        placeholder="Indian"
        required
      />

      <Input
        type="date"
        label="Date of Birth"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        error={errors.dob}
        required
      />

      <div className="pt-2">
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          variant="accent"
        >
          Confirm Booking
        </Button>
      </div>
    </form>
  );
}
