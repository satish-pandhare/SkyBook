"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cancelBooking } from "@/lib/actions/booking";
import { formatDate, formatTime, formatCurrency } from "@/utils/format";
import { AIRPORTS, type AirportCode, SEAT_CLASS_LABELS, type SeatClass } from "@/utils/constants";
import type { BookingWithDetails } from "@/types/database";

interface BookingCardProps {
  booking: BookingWithDetails;
}

const statusBadgeMap: Record<string, BadgeVariant> = {
  confirmed: "success",
  cancelled: "danger",
  rescheduled: "warning",
};

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const { flight, seat } = booking;
  const origin = AIRPORTS[flight.origin as AirportCode];
  const dest = AIRPORTS[flight.destination as AirportCode];
  const isActive = booking.status === "confirmed";
  const departureDate = new Date(flight.departs_at);
  const isPast = departureDate < new Date();

  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelError("");

    const result = await cancelBooking(booking.id);

    if (result.error) {
      setCancelError(result.error);
      setIsCancelling(false);
      return;
    }

    setShowCancelModal(false);
    router.refresh();
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Top bar with PNR and status */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-lg border border-brand-500/20">
              {booking.pnr_code}
            </span>
            <Badge variant={statusBadgeMap[booking.status] ?? "default"}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
          <span className="text-xs text-slate-600">
            Booked {formatDate(booking.booked_at)}
          </span>
        </div>

        {/* Route + times */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-lg font-bold text-white">
              {origin?.city ?? flight.origin}
            </p>
            <p className="text-sm text-slate-400">
              {formatTime(flight.departs_at)}
            </p>
            <p className="text-xs text-slate-600">{flight.origin}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1 min-w-[60px]">
            <span className="text-xs font-mono text-slate-500">
              {flight.flight_no}
            </span>
            <div className="w-full flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-slate-500 mx-1"
              >
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
            </div>
            <span className="text-xs text-slate-600">
              {formatDate(flight.departs_at)}
            </span>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-white">
              {dest?.city ?? flight.destination}
            </p>
            <p className="text-sm text-slate-400">
              {formatTime(flight.arrives_at)}
            </p>
            <p className="text-xs text-slate-600">{flight.destination}</p>
          </div>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-5 pb-5 border-b border-white/5">
          <div>
            <span className="text-slate-500">Seat </span>
            <span className="text-white font-medium">{seat.seat_number}</span>
          </div>
          <div>
            <span className="text-slate-500">Class </span>
            <span className="text-white font-medium">
              {SEAT_CLASS_LABELS[seat.class as SeatClass]}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Total </span>
            <span className="text-white font-semibold">
              {formatCurrency(booking.total_price)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {isActive && !isPast && (
          <div className="flex gap-3">
            <Link href={`/reschedule/${booking.id}`}>
              <Button variant="outline" size="sm">
                Reschedule
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Booking
            </Button>
          </div>
        )}

        {isActive && isPast && (
          <p className="text-xs text-slate-600">
            This flight has already departed.
          </p>
        )}
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelError("");
        }}
        title="Cancel Booking"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Are you sure you want to cancel booking{" "}
            <span className="text-white font-mono font-semibold">
              {booking.pnr_code}
            </span>
            ? This action cannot be undone.
          </p>

          {cancelError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {cancelError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCancelModal(false);
                setCancelError("");
              }}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              isLoading={isCancelling}
              className="flex-1"
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
