import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MyBookingsClient } from "@/components/booking/my-bookings-client";
import type { BookingWithDetails } from "@/types/database";

export const metadata: Metadata = {
  title: "My Bookings",
  description: "View and manage your flight bookings.",
};

export default async function MyBookingsPage() {
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*, flight:flights(*), seat:seats(*), passengers(*)")
    .order("booked_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 text-center">
          <p className="text-red-400">Failed to load bookings: {error.message}</p>
        </div>
      </div>
    );
  }

  const typedBookings = (bookings ?? []) as unknown as BookingWithDetails[];

  return <MyBookingsClient initialBookings={typedBookings} />;
}
