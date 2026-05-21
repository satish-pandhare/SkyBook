"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Flight, Seat } from "@/types/database";
import type { BookingStep } from "@/utils/constants";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
}

interface PassengerFormData {
  fullName: string;
  nationality: string;
  dob: string;
}

/**
 * Sensitive passenger data that must NEVER be persisted.
 */
interface SensitivePassengerData {
  passportNo: string;
}

interface FlightState {
  // Search
  searchQuery: SearchQuery | null;

  // Selection
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  previousSeat: Seat | null; // for optimistic rollback

  // Booking flow
  bookingStep: BookingStep;
  passengerData: PassengerFormData | null;
  sensitiveData: SensitivePassengerData | null;
}

interface FlightActions {
  setSearchQuery: (query: SearchQuery) => void;
  selectFlight: (flight: Flight) => void;
  selectSeat: (seat: Seat) => void;
  rollbackSeatSelection: () => void;
  setPassengerData: (data: PassengerFormData) => void;
  setSensitiveData: (data: SensitivePassengerData) => void;
  setBookingStep: (step: BookingStep) => void;
  reset: () => void;
}

type FlightStore = FlightState & FlightActions;

// ──────────────────────────────────────────────
// Initial state
// ──────────────────────────────────────────────

const initialState: FlightState = {
  searchQuery: null,
  selectedFlight: null,
  selectedSeat: null,
  previousSeat: null,
  bookingStep: "search",
  passengerData: null,
  sensitiveData: null,
};

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchQuery: (searchQuery) =>
        set({ searchQuery }),

      selectFlight: (selectedFlight) =>
        set({ selectedFlight, selectedSeat: null, bookingStep: "seats" }),

      selectSeat: (seat) =>
        set((state) => ({
          previousSeat: state.selectedSeat,
          selectedSeat: seat,
        })),

      rollbackSeatSelection: () =>
        set((state) => ({
          selectedSeat: state.previousSeat,
          previousSeat: null,
        })),

      setPassengerData: (passengerData) =>
        set({ passengerData }),

      setSensitiveData: (sensitiveData) =>
        set({ sensitiveData }),

      setBookingStep: (bookingStep) =>
        set({ bookingStep }),

      reset: () => set(initialState),
    }),
    {
      name: "skybook-flight",
      version: 2, // Bumped to invalidate stale pre-migration data
      // CRITICAL: partialize to EXCLUDE sensitive data from persistence
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        bookingStep: state.bookingStep,
        selectedFlight: state.selectedFlight,
        // selectedSeat is persisted so it survives page navigations;
        // the reserve_seat RPC validates availability at booking time
        selectedSeat: state.selectedSeat,
        // passengerData contains only name/nationality/dob — safe to persist
        passengerData: state.passengerData,
        // EXCLUDED from persistence:
        // - sensitiveData (passport numbers)
        // - previousSeat (rollback state)
      }),
    }
  )
);

export type { SearchQuery, PassengerFormData, SensitivePassengerData };
