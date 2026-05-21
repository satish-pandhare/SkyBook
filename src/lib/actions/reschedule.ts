"use server";

import { createClient } from "@/lib/supabase/server";

interface RescheduleResult {
  newBookingId?: string;
  newPnrCode?: string;
  feeCharged?: number;
  error?: string;
}

/**
 * Server Action to reschedule a booking via the reschedule_booking RPC.
 */
export async function rescheduleBooking(
  bookingId: string,
  newFlightId: string,
  newSeatId: string
): Promise<RescheduleResult> {
  if (!bookingId || !newFlightId || !newSeatId) {
    return { error: "Missing required fields for reschedule" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { data, error } = await (
    supabase.rpc as unknown as (
      name: string,
      args: Record<string, unknown>
    ) => Promise<{ data: unknown; error: { message: string } | null }>
  )("reschedule_booking", {
    p_booking_id: bookingId,
    p_user_id: user.id,
    p_new_flight_id: newFlightId,
    p_new_seat_id: newSeatId,
  });

  if (error) {
    if (error.message.includes("no longer available")) {
      return { error: "The selected seat is no longer available." };
    }
    if (error.message.includes("already departed")) {
      return { error: "Cannot reschedule to a flight that has already departed." };
    }
    return { error: error.message };
  }

  const result = data as unknown as {
    new_booking_id: string;
    new_pnr_code: string;
    fee_charged: number;
  };

  return {
    newBookingId: result.new_booking_id,
    newPnrCode: result.new_pnr_code,
    feeCharged: result.fee_charged,
  };
}
