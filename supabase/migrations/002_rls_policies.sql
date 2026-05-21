-- ============================================================
-- Migration 002: Row Level Security (RLS) Policies
-- Flight Management Web Application
-- ============================================================

-- ──────────────────────────────────────────────
-- Enable RLS on all tables
-- ──────────────────────────────────────────────

ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- FLIGHTS: Any authenticated user can read
-- (No write access — flights are managed by admins)
-- ──────────────────────────────────────────────

CREATE POLICY "flights_select_authenticated"
  ON flights FOR SELECT
  TO authenticated
  USING (true);

-- ──────────────────────────────────────────────
-- SEATS: Any authenticated user can read
-- (Updates happen only through RPC functions)
-- ──────────────────────────────────────────────

CREATE POLICY "seats_select_authenticated"
  ON seats FOR SELECT
  TO authenticated
  USING (true);

-- ──────────────────────────────────────────────
-- BOOKINGS: Users can only see their own bookings
-- ──────────────────────────────────────────────

-- Read own bookings
CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert bookings for self only
CREATE POLICY "bookings_insert_own"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update own bookings (for cancellation/reschedule)
CREATE POLICY "bookings_update_own"
  ON bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- PASSENGERS: Access through own bookings
-- ──────────────────────────────────────────────

CREATE POLICY "passengers_select_own"
  ON passengers FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_insert_own"
  ON passengers FOR INSERT
  TO authenticated
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────
-- RESCHEDULES: Access through own bookings
-- ──────────────────────────────────────────────

CREATE POLICY "reschedules_select_own"
  ON reschedules FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reschedules_insert_own"
  ON reschedules FOR INSERT
  TO authenticated
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );
