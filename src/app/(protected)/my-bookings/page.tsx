import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BookingCard } from "@/components/booking/booking-card";
import type { BookingWithDetails } from "@/types/database";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Bookings</h1>
          <p className="text-slate-500">
            {typedBookings.length > 0
              ? `${typedBookings.length} booking${typedBookings.length !== 1 ? "s" : ""}`
              : "No bookings yet"}
          </p>
        </div>
        <Link href="/flights">
          <Button variant="primary" size="md">
            Book a Flight
          </Button>
        </Link>
      </div>

      {typedBookings.length === 0 ? (
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
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No bookings yet
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Search for flights and make your first booking!
          </p>
          <Link href="/flights">
            <Button variant="accent">Search Flights</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {typedBookings.map((booking, index) => (
            <div
              key={booking.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
            >
              <BookingCard booking={booking} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
