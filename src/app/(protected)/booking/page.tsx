import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingPageClient } from "@/components/booking/booking-page-client";
import { PageSpinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Book Flight",
  description: "Enter passenger details and confirm your flight booking.",
};

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Complete Your Booking
        </h1>
        <p className="text-slate-500">
          Fill in passenger details to confirm your reservation
        </p>
      </div>

      <Suspense fallback={<PageSpinner />}>
        <BookingPageClient />
      </Suspense>
    </div>
  );
}
