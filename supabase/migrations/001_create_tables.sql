-- ============================================================
-- Migration 001: Create Tables
-- Flight Management Web Application
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────
-- 1. FLIGHTS
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_no VARCHAR(10) NOT NULL UNIQUE,
  origin VARCHAR(3) NOT NULL,
  destination VARCHAR(3) NOT NULL,
  departs_at TIMESTAMPTZ NOT NULL,
  arrives_at TIMESTAMPTZ NOT NULL,
  aircraft_type VARCHAR(50) NOT NULL DEFAULT 'Boeing 737',
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  base_price NUMERIC(10, 2) NOT NULL,

  -- Constraints
  CONSTRAINT chk_flight_status CHECK (status IN ('scheduled', 'delayed', 'cancelled', 'completed')),
  CONSTRAINT chk_flight_times CHECK (arrives_at > departs_at),
  CONSTRAINT chk_origin_dest CHECK (origin != destination),
  CONSTRAINT chk_base_price CHECK (base_price > 0)
);

-- Index for search queries (origin + destination + date)
CREATE INDEX IF NOT EXISTS idx_flights_route_date
  ON flights (origin, destination, departs_at);

-- ──────────────────────────────────────────────
-- 2. SEATS
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat_number VARCHAR(5) NOT NULL,
  class VARCHAR(10) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  extra_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,

  -- Constraints
  CONSTRAINT chk_seat_class CHECK (class IN ('economy', 'business', 'first')),
  CONSTRAINT chk_extra_fee CHECK (extra_fee >= 0),
  CONSTRAINT uq_seat_per_flight UNIQUE (flight_id, seat_number)
);

-- Index for seat lookup by flight
CREATE INDEX IF NOT EXISTS idx_seats_flight ON seats (flight_id);

-- Index for available seats query
CREATE INDEX IF NOT EXISTS idx_seats_available ON seats (flight_id, is_available);

-- ──────────────────────────────────────────────
-- 3. BOOKINGS
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  booked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_price NUMERIC(10, 2) NOT NULL,
  pnr_code VARCHAR(6) NOT NULL UNIQUE,

  -- Constraints
  CONSTRAINT chk_booking_status CHECK (status IN ('confirmed', 'cancelled', 'rescheduled')),
  CONSTRAINT chk_total_price CHECK (total_price > 0)
);

-- Partial unique index: one active booking per seat
-- Allows multiple cancelled bookings for the same seat
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_seat_booking
  ON bookings (seat_id) WHERE status != 'cancelled';

-- Index for user's bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id, booked_at DESC);

-- Index for PNR lookup
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings (pnr_code);

-- ──────────────────────────────────────────────
-- 4. PASSENGERS
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  passport_no VARCHAR(20) NOT NULL,
  nationality VARCHAR(50) NOT NULL,
  dob DATE NOT NULL,

  -- Constraints
  CONSTRAINT chk_full_name CHECK (char_length(full_name) >= 2)
);

-- Index for passenger lookup
CREATE INDEX IF NOT EXISTS idx_passengers_booking ON passengers (booking_id);

-- ──────────────────────────────────────────────
-- 5. RESCHEDULES
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reschedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_flight_id UUID NOT NULL REFERENCES flights(id),
  new_flight_id UUID NOT NULL REFERENCES flights(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fee_charged NUMERIC(10, 2) NOT NULL DEFAULT 0,

  -- Constraints
  CONSTRAINT chk_reschedule_flights CHECK (old_flight_id != new_flight_id),
  CONSTRAINT chk_fee_charged CHECK (fee_charged >= 0)
);

-- Index for reschedule history
CREATE INDEX IF NOT EXISTS idx_reschedules_booking ON reschedules (booking_id);
