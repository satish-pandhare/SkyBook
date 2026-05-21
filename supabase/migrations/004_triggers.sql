-- ============================================================
-- Migration 004: Triggers & Constraints
-- Flight Management Web Application
--
-- Defense-in-depth: these triggers enforce business rules
-- at the database level, even if the application layer
-- has a bug or is bypassed.
-- ============================================================

-- ──────────────────────────────────────────────
-- Trigger: Prevent cancellation within 2 hours of departure
-- (backup for the cancel_booking RPC check)
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_cancellation_window()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_departs_at TIMESTAMPTZ;
BEGIN
  -- Only check when status is being changed to 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT departs_at INTO v_departs_at
    FROM flights
    WHERE id = NEW.flight_id;

    IF v_departs_at - INTERVAL '2 hours' <= now() THEN
      RAISE EXCEPTION 'Cannot cancel booking within 2 hours of departure (departure: %)', v_departs_at;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_cancellation_window
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_cancellation_window();

-- ──────────────────────────────────────────────
-- Trigger: Update timestamps on booking changes
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_booking_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Keep booked_at as the original booking time
  -- This trigger exists as a placeholder for audit logging
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_timestamp();

-- ──────────────────────────────────────────────
-- Enable Realtime for seats table
-- (Required for Supabase Realtime subscriptions)
-- ──────────────────────────────────────────────

-- Note: In Supabase, you also need to enable realtime via the Dashboard:
-- Database → Replication → Toggle ON for 'seats' table
-- The SQL below adds the table to the supabase_realtime publication.

DO $$
BEGIN
  -- Check if the publication exists before altering it
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE seats;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Table already in publication, ignore
    NULL;
END;
$$;
