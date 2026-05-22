"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingCard } from "@/components/booking/booking-card";
import { createClient } from "@/lib/supabase/client";
import type { BookingWithDetails } from "@/types/database";

const CACHE_KEY = "skybook-cached-bookings";

interface MyBookingsClientProps {
  /** Server-fetched bookings passed as initial data */
  initialBookings: BookingWithDetails[];
}

export function MyBookingsClient({ initialBookings }: MyBookingsClientProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>(initialBookings);
  const [isOffline, setIsOffline] = useState(false);
  const [isCachedData, setIsCachedData] = useState(false);

  const cacheBookings = useCallback((nextBookings: BookingWithDetails[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(nextBookings));
      localStorage.setItem(`${CACHE_KEY}-timestamp`, new Date().toISOString());
    } catch {
      // localStorage might be full or disabled — silently ignore
    }
  }, []);

  const loadCachedBookings = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setBookings(JSON.parse(cached) as BookingWithDetails[]);
        setIsCachedData(true);
        return true;
      }
    } catch {
      // Corrupted cache — ignore
    }
    setIsCachedData(false);
    return false;
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOffline(true);
      loadCachedBookings();
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("bookings")
        .select("*, flight:flights(*), seat:seats(*), passengers(*)")
        .order("booked_at", { ascending: false });

      if (error) {
        throw error;
      }

      const nextBookings = (data ?? []) as BookingWithDetails[];
      setBookings(nextBookings);
      setIsCachedData(false);
      cacheBookings(nextBookings);
    } catch {
      if (!navigator.onLine) {
        setIsOffline(true);
      }
      loadCachedBookings();
    }
  }, [cacheBookings, loadCachedBookings]);

  useEffect(() => {
    // If we received server data, cache it for offline use
    if (initialBookings.length > 0) {
      cacheBookings(initialBookings);
    }
  }, [cacheBookings, initialBookings]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      fetchBookings();
    };
    const handleOffline = () => {
      setIsOffline(true);
      loadCachedBookings();
    };

    if (!navigator.onLine) {
      setIsOffline(true);
      if (initialBookings.length === 0) {
        loadCachedBookings();
      }
    } else {
      fetchBookings();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchBookings, initialBookings.length, loadCachedBookings]);

  const cachedTimestamp = (() => {
    if (typeof window === "undefined") return null;
    try {
      const ts = localStorage.getItem(`${CACHE_KEY}-timestamp`);
      if (ts) return new Date(ts).toLocaleString();
    } catch {
      // ignore
    }
    return null;
  })();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Offline banner */}
      {(isOffline || isCachedData) && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-400 mt-0.5 shrink-0"
          >
            <path d="M12.01 21.49 23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-300">
              {isOffline ? "Viewing cached data — you are offline" : "Viewing cached data"}
            </p>
            {cachedTimestamp && (
              <p className="text-xs text-amber-400/60 mt-0.5">
                Last updated: {cachedTimestamp}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Bookings</h1>
          <p className="text-slate-500">
            {bookings.length > 0
              ? `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`
              : "No bookings yet"}
          </p>
        </div>
        <Link href="/flights">
          <Button variant="primary" size="md">
            Book a Flight
          </Button>
        </Link>
      </div>

      {/* Content */}
      {bookings.length === 0 ? (
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
            {isOffline ? "No cached bookings" : "No bookings yet"}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {isOffline
              ? "Connect to the internet to load your bookings."
              : "Search for flights and make your first booking!"}
          </p>
          {!isOffline && (
            <Link href="/flights">
              <Button variant="accent">Search Flights</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
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
