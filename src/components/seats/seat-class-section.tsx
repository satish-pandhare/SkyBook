"use client";

import { useMemo } from "react";
import { SeatCell } from "@/components/seats/seat-cell";
import { cn } from "@/utils/cn";
import { SEAT_CLASS_LABELS, type SeatClass } from "@/utils/constants";
import { formatCurrency } from "@/utils/format";
import type { Seat } from "@/types/database";
import type { SeatStatus } from "@/utils/constants";

interface SeatClassSectionProps {
  seatClass: SeatClass;
  seats: Seat[];
  selectedSeatId: string | null;
  userSeatIds: string[];
  onSelect: (seat: Seat) => void;
  basePrice: number;
}

/**
 * Renders a section of the seat map for one class (first/business/economy).
 * Groups seats into rows and renders them in a 3-aisle-3 layout.
 */
export function SeatClassSection({
  seatClass,
  seats,
  selectedSeatId,
  userSeatIds,
  onSelect,
  basePrice,
}: SeatClassSectionProps) {
  // Group seats by row number
  const rows = useMemo(() => {
    const rowMap = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      const rowNum = seat.seat_number.replace(/[A-F]/g, "");
      const existing = rowMap.get(rowNum) || [];
      existing.push(seat);
      rowMap.set(rowNum, existing);
    });

    // Sort rows numerically, sort seats within each row alphabetically
    return Array.from(rowMap.entries())
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([rowNum, rowSeats]) => ({
        rowNum,
        seats: rowSeats.sort((a, b) =>
          a.seat_number.localeCompare(b.seat_number)
        ),
      }));
  }, [seats]);

  if (seats.length === 0) return null;

  const extraFee = seats[0]?.extra_fee ?? 0;
  const totalPrice = basePrice + extraFee;

  const getSeatStatus = (seat: Seat): SeatStatus => {
    if (userSeatIds.includes(seat.id)) return "yours";
    if (seat.id === selectedSeatId) return "selected";
    if (!seat.is_available) return "occupied";
    return "available";
  };

  // Class badge colors
  const classBadgeColors: Record<SeatClass, string> = {
    first: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    business: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    economy: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  };

  return (
    <div className="space-y-3">
      {/* Class header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-lg text-xs font-medium border",
              classBadgeColors[seatClass]
            )}
          >
            {SEAT_CLASS_LABELS[seatClass]}
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {formatCurrency(totalPrice)}/seat
          {extraFee > 0 && (
            <span className="text-slate-600 ml-1">
              (+{formatCurrency(extraFee)} extra)
            </span>
          )}
        </span>
      </div>

      {/* Seats grid */}
      <div className="space-y-2">
        {rows.map(({ rowNum, seats: rowSeats }) => {
          // Split into left (A,B,C) and right (D,E,F)
          const leftSeats = rowSeats.filter((s) => {
            const col = s.seat_number.replace(/[0-9]/g, "");
            return col <= "C";
          });
          const rightSeats = rowSeats.filter((s) => {
            const col = s.seat_number.replace(/[0-9]/g, "");
            return col > "C";
          });

          return (
            <div key={rowNum} className="flex items-center justify-center gap-3 sm:gap-4">
              {/* Row number */}
              <span className="w-5 text-right text-xs text-slate-600 font-mono">
                {rowNum}
              </span>

              {/* Left seats (A, B, C) */}
              <div className="flex gap-1.5">
                {leftSeats.map((seat) => (
                  <SeatCell
                    key={seat.id}
                    seat={seat}
                    status={getSeatStatus(seat)}
                    onSelect={onSelect}
                  />
                ))}
              </div>

              {/* Aisle */}
              <div className="w-6 sm:w-8 flex items-center justify-center">
                <div className="w-px h-8 bg-white/5" />
              </div>

              {/* Right seats (D, E, F) */}
              <div className="flex gap-1.5">
                {rightSeats.map((seat) => (
                  <SeatCell
                    key={seat.id}
                    seat={seat}
                    status={getSeatStatus(seat)}
                    onSelect={onSelect}
                  />
                ))}
              </div>

              {/* Row number (right) */}
              <span className="w-5 text-left text-xs text-slate-600 font-mono">
                {rowNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
