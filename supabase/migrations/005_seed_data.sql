-- ============================================================
-- Migration 005: Seed Data
-- Flight Management Web Application
--
-- Seeds 8 flights across 4 routes with full seat maps.
-- All dates are set relative to CURRENT_DATE so data
-- stays valid regardless of when the migration is run.
-- ============================================================

-- ──────────────────────────────────────────────
-- Route 1: DEL → BOM (New Delhi → Mumbai)
-- ──────────────────────────────────────────────

INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'SK-101', 'DEL', 'BOM',
   CURRENT_DATE + INTERVAL '3 days' + INTERVAL '6 hours',
   CURRENT_DATE + INTERVAL '3 days' + INTERVAL '8 hours 15 minutes',
   'Boeing 737-800', 'scheduled', 4500),

  ('a1000000-0000-0000-0000-000000000002', 'SK-102', 'DEL', 'BOM',
   CURRENT_DATE + INTERVAL '5 days' + INTERVAL '14 hours',
   CURRENT_DATE + INTERVAL '5 days' + INTERVAL '16 hours 10 minutes',
   'Airbus A320', 'scheduled', 5200);

-- ──────────────────────────────────────────────
-- Route 2: BLR → HYD (Bengaluru → Hyderabad)
-- ──────────────────────────────────────────────

INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('a2000000-0000-0000-0000-000000000001', 'SK-201', 'BLR', 'HYD',
   CURRENT_DATE + INTERVAL '2 days' + INTERVAL '9 hours',
   CURRENT_DATE + INTERVAL '2 days' + INTERVAL '10 hours 20 minutes',
   'Boeing 737-800', 'scheduled', 3200),

  ('a2000000-0000-0000-0000-000000000002', 'SK-202', 'BLR', 'HYD',
   CURRENT_DATE + INTERVAL '4 days' + INTERVAL '18 hours',
   CURRENT_DATE + INTERVAL '4 days' + INTERVAL '19 hours 25 minutes',
   'Airbus A320neo', 'scheduled', 3800);

-- ──────────────────────────────────────────────
-- Route 3: CCU → MAA (Kolkata → Chennai)
-- ──────────────────────────────────────────────

INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('a3000000-0000-0000-0000-000000000001', 'SK-301', 'CCU', 'MAA',
   CURRENT_DATE + INTERVAL '3 days' + INTERVAL '7 hours 30 minutes',
   CURRENT_DATE + INTERVAL '3 days' + INTERVAL '10 hours',
   'Boeing 737 MAX 8', 'scheduled', 5800),

  ('a3000000-0000-0000-0000-000000000002', 'SK-302', 'CCU', 'MAA',
   CURRENT_DATE + INTERVAL '6 days' + INTERVAL '12 hours',
   CURRENT_DATE + INTERVAL '6 days' + INTERVAL '14 hours 30 minutes',
   'Airbus A321', 'scheduled', 6200);

-- ──────────────────────────────────────────────
-- Route 4: DEL → BLR (New Delhi → Bengaluru)
-- ──────────────────────────────────────────────

INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('a4000000-0000-0000-0000-000000000001', 'SK-401', 'DEL', 'BLR',
   CURRENT_DATE + INTERVAL '2 days' + INTERVAL '5 hours 30 minutes',
   CURRENT_DATE + INTERVAL '2 days' + INTERVAL '8 hours 15 minutes',
   'Boeing 787 Dreamliner', 'scheduled', 7500),

  ('a4000000-0000-0000-0000-000000000002', 'SK-402', 'DEL', 'BLR',
   CURRENT_DATE + INTERVAL '7 days' + INTERVAL '20 hours',
   CURRENT_DATE + INTERVAL '7 days' + INTERVAL '22 hours 40 minutes',
   'Airbus A320', 'scheduled', 6800);

-- ──────────────────────────────────────────────
-- Seat Maps
-- Each flight gets 30 seats:
--   First Class:  Row 1 (1A–1F) = 6 seats, extra_fee = 3000
--   Business:     Rows 2–3 (2A–2F, 3A–3F) = 12 seats, extra_fee = 1500
--   Economy:      Rows 4–5 (4A–4F, 5A–5F) = 12 seats, extra_fee = 0
-- ──────────────────────────────────────────────

-- Function to generate seats for a flight
CREATE OR REPLACE FUNCTION seed_seats_for_flight(p_flight_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_row INTEGER;
  v_col CHAR;
  v_class VARCHAR(10);
  v_extra_fee NUMERIC;
  v_cols CHAR[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F'];
BEGIN
  FOR v_row IN 1..5 LOOP
    -- Determine class and fee based on row
    IF v_row = 1 THEN
      v_class := 'first';
      v_extra_fee := 3000;
    ELSIF v_row <= 3 THEN
      v_class := 'business';
      v_extra_fee := 1500;
    ELSE
      v_class := 'economy';
      v_extra_fee := 0;
    END IF;

    FOREACH v_col IN ARRAY v_cols LOOP
      INSERT INTO seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, v_row || v_col, v_class, true, v_extra_fee);
    END LOOP;
  END LOOP;
END;
$$;

-- Generate seat maps for all flights
SELECT seed_seats_for_flight('a1000000-0000-0000-0000-000000000001');
SELECT seed_seats_for_flight('a1000000-0000-0000-0000-000000000002');
SELECT seed_seats_for_flight('a2000000-0000-0000-0000-000000000001');
SELECT seed_seats_for_flight('a2000000-0000-0000-0000-000000000002');
SELECT seed_seats_for_flight('a3000000-0000-0000-0000-000000000001');
SELECT seed_seats_for_flight('a3000000-0000-0000-0000-000000000002');
SELECT seed_seats_for_flight('a4000000-0000-0000-0000-000000000001');
SELECT seed_seats_for_flight('a4000000-0000-0000-0000-000000000002');

-- Clean up the helper function
DROP FUNCTION IF EXISTS seed_seats_for_flight;

-- ──────────────────────────────────────────────
-- Mark a few seats as occupied for realism
-- (Simulate some pre-existing bookings)
-- ──────────────────────────────────────────────

UPDATE seats SET is_available = false
WHERE flight_id = 'a1000000-0000-0000-0000-000000000001'
  AND seat_number IN ('1A', '2C', '4E');

UPDATE seats SET is_available = false
WHERE flight_id = 'a2000000-0000-0000-0000-000000000001'
  AND seat_number IN ('1B', '3F', '5A');

UPDATE seats SET is_available = false
WHERE flight_id = 'a3000000-0000-0000-0000-000000000001'
  AND seat_number IN ('2A', '4B');

UPDATE seats SET is_available = false
WHERE flight_id = 'a4000000-0000-0000-0000-000000000001'
  AND seat_number IN ('1C', '1D', '3A', '5F');

-- ──────────────────────────────────────────────
-- NOTE: Test user creation
-- ──────────────────────────────────────────────
-- Create a test user via the Supabase Auth dashboard or API:
--   Email: test@skybook.com
--   Password: Test1234!
--
-- Supabase Auth users are stored in auth.users, not in a
-- custom table. The user_id in bookings references auth.users(id).
-- ──────────────────────────────────────────────
