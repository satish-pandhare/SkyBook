"use server";

import { createClient } from "@/lib/supabase/server";
import { bookingSchema } from "@/lib/validators/booking";

interface BookingResult {
  bookingId?: string;
  pnrCode?: string;
  totalPrice?: number;
  error?: string;
}

/**
 * Server Action to create a booking via the reserve_seat RPC.
 * Validates input with Zod, then calls the atomic PostgreSQL function.
 */
export async function createBooking(formData: FormData): Promise<BookingResult> {
  const raw = {
    flightId: formData.get("flightId") as string,
    seatId: formData.get("seatId") as string,
    fullName: formData.get("fullName") as string,
    passportNo: formData.get("passportNo") as string,
    nationality: formData.get("nationality") as string,
    dob: formData.get("dob") as string,
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to book a flight" };
  }

  // Call the atomic RPC function
  const { data, error } = await (
    supabase.rpc as unknown as (
      name: string,
      args: Record<string, unknown>
    ) => Promise<{ data: unknown; error: { message: string } | null }>
  )("reserve_seat", {
    p_flight_id: parsed.data.flightId,
    p_seat_id: parsed.data.seatId,
    p_user_id: user.id,
    p_full_name: parsed.data.fullName,
    p_passport_no: parsed.data.passportNo,
    p_nationality: parsed.data.nationality,
    p_dob: parsed.data.dob,
  });

  if (error) {
    // Map PostgreSQL errors to user-friendly messages
    if (error.message.includes("no longer available")) {
      return { error: "This seat was just booked by another passenger. Please select a different seat." };
    }
    return { error: error.message };
  }

  // The RPC returns a JSON object
  const result = data as unknown as {
    booking_id: string;
    pnr_code: string;
    total_price: number;
  };

  return {
    bookingId: result.booking_id,
    pnrCode: result.pnr_code,
    totalPrice: result.total_price,
  };
}

/**
 * Server Action to cancel a booking via the cancel_booking RPC.
 */
export async function cancelBooking(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await (
    supabase.rpc as unknown as (
      name: string,
      args: Record<string, unknown>
    ) => Promise<{ data: unknown; error: { message: string } | null }>
  )("cancel_booking", {
    p_booking_id: bookingId,
    p_user_id: user.id,
  });

  if (error) {
    if (error.message.includes("2 hours")) {
      return { error: "Cannot cancel within 2 hours of departure." };
    }
    if (error.message.includes("already been cancelled")) {
      return { error: "This booking has already been cancelled." };
    }
    return { error: error.message };
  }

  return {};
}
