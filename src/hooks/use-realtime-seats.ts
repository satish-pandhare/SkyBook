"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Seat } from "@/types/database";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/**
 * Hook that fetches seats for a flight and subscribes to real-time updates.
 *
 * When another user books or releases a seat, the UI updates instantly
 * without a page refresh.
 */
export function useRealtimeSeats(flightId: string) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle real-time seat changes
  const handleSeatChange = useCallback(
    (payload: RealtimePostgresChangesPayload<Seat>) => {
      if (payload.eventType === "UPDATE" && payload.new) {
        const updatedSeat = payload.new as Seat;
        setSeats((prev) =>
          prev.map((seat) =>
            seat.id === updatedSeat.id ? updatedSeat : seat
          )
        );
      }
    },
    []
  );

  useEffect(() => {
    const supabase = createClient();

    // 1. Fetch initial seats
    const fetchSeats = async () => {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("seats")
        .select("*")
        .eq("flight_id", flightId)
        .order("seat_number", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setSeats(data ?? []);
      }
      setIsLoading(false);
    };

    fetchSeats();

    // 2. Subscribe to real-time changes on this flight's seats
    const channel = supabase
      .channel(`seats-flight-${flightId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flightId}`,
        },
        handleSeatChange
      )
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [flightId, handleSeatChange]);

  return { seats, isLoading, error };
}
