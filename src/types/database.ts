// ──────────────────────────────────────────────
// Database row types (mirrors PostgreSQL schema)
// ──────────────────────────────────────────────

export interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: "scheduled" | "delayed" | "cancelled" | "completed";
  base_price: number;
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: "economy" | "business" | "first";
  is_available: boolean;
  extra_fee: number;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string;
  status: "confirmed" | "cancelled" | "rescheduled";
  booked_at: string;
  total_price: number;
  pnr_code: string;
}

export interface Passenger {
  id: string;
  booking_id: string;
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
}

export interface Reschedule {
  id: string;
  booking_id: string;
  old_flight_id: string;
  new_flight_id: string;
  requested_at: string;
  fee_charged: number;
}

// ──────────────────────────────────────────────
// Joined / enriched types (for UI display)
// ──────────────────────────────────────────────

export interface BookingWithDetails extends Booking {
  flight: Flight;
  seat: Seat;
  passengers: Passenger[];
}

export interface FlightWithSeats extends Flight {
  seats: Seat[];
}

// ──────────────────────────────────────────────
// Supabase Database type definition
// ──────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      flights: {
        Row: Flight;
        Insert: Omit<Flight, "id">;
        Update: Partial<Omit<Flight, "id">>;
      };
      seats: {
        Row: Seat;
        Insert: Omit<Seat, "id">;
        Update: Partial<Omit<Seat, "id">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "booked_at">;
        Update: Partial<Omit<Booking, "id">>;
      };
      passengers: {
        Row: Passenger;
        Insert: Omit<Passenger, "id">;
        Update: Partial<Omit<Passenger, "id">>;
      };
      reschedules: {
        Row: Reschedule;
        Insert: Omit<Reschedule, "id" | "requested_at">;
        Update: Partial<Omit<Reschedule, "id">>;
      };
    };
    Functions: {
      reserve_seat: {
        Args: {
          p_flight_id: string;
          p_seat_id: string;
          p_user_id: string;
          p_full_name: string;
          p_passport_no: string;
          p_nationality: string;
          p_dob: string;
        };
        Returns: {
          booking_id: string;
          pnr_code: string;
          total_price: number;
        };
      };
      cancel_booking: {
        Args: {
          p_booking_id: string;
          p_user_id: string;
        };
        Returns: void;
      };
      reschedule_booking: {
        Args: {
          p_booking_id: string;
          p_user_id: string;
          p_new_flight_id: string;
          p_new_seat_id: string;
        };
        Returns: {
          new_booking_id: string;
          new_pnr_code: string;
          fee_charged: number;
        };
      };
    };
  };
}
