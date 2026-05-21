"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface UserSession {
  id: string;
  email: string;
}

interface BookingSummary {
  id: string;
  pnr_code: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  status: "confirmed" | "cancelled" | "rescheduled";
}

interface UserState {
  user: UserSession | null;
  bookings: BookingSummary[];
}

interface UserActions {
  setUser: (user: UserSession) => void;
  setBookings: (bookings: BookingSummary[]) => void;
  clearUser: () => void;
}

type UserStore = UserState & UserActions;

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      bookings: [],

      // Actions
      setUser: (user) => set({ user }),
      setBookings: (bookings) => set({ bookings }),
      clearUser: () => set({ user: null, bookings: [] }),
    }),
    {
      name: "skybook-user",
      // Only persist minimal session info — never persist tokens or sensitive data
      partialize: (state) => ({
        user: state.user,
        // Don't persist bookings — they should be fetched fresh
      }),
    }
  )
);

export type { UserSession, BookingSummary };
