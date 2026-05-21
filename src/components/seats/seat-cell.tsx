"use client";

import { cn } from "@/utils/cn";
import type { Seat } from "@/types/database";
import type { SeatStatus } from "@/utils/constants";

interface SeatCellProps {
  seat: Seat;
  status: SeatStatus;
  onSelect: (seat: Seat) => void;
}

/**
 * Individual seat button in the seat map.
 * Color-coded by status, sized for touch (min 44x44px).
 */
export function SeatCell({ seat, status, onSelect }: SeatCellProps) {
  const isInteractive = status === "available" || status === "selected";

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={() => isInteractive && onSelect(seat)}
      title={`Seat ${seat.seat_number} — ${seat.class}${
        !seat.is_available ? " (Occupied)" : ""
      }`}
      aria-label={`Seat ${seat.seat_number}, ${seat.class} class, ${
        status === "available"
          ? "available"
          : status === "occupied"
          ? "occupied"
          : status === "selected"
          ? "selected"
          : "your seat"
      }`}
      className={cn(
        // Base
        "relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg text-xs font-medium",
        "flex items-center justify-center",
        "transition-all duration-200 border",
        // Status colors
        status === "available" &&
          "bg-slate-700/80 hover:bg-slate-600 border-slate-600 text-slate-300 hover:text-white hover:scale-105 active:scale-95 cursor-pointer",
        status === "occupied" &&
          "bg-slate-800/30 border-slate-700/30 text-slate-600 cursor-not-allowed opacity-40",
        status === "selected" &&
          "bg-brand-500 border-brand-400 text-white ring-2 ring-brand-400/50 scale-105 cursor-pointer",
        status === "yours" &&
          "bg-accent-500 border-accent-400 text-white cursor-default"
      )}
    >
      {seat.seat_number}

      {/* Selection indicator dot */}
      {status === "selected" && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-400 rounded-full animate-pulse-soft" />
      )}
    </button>
  );
}
