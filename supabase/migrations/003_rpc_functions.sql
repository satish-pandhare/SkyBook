-- ============================================================
-- Migration 003: RPC Functions
-- Flight Management Web Application
--
-- These functions run with SECURITY DEFINER to bypass RLS
-- and perform atomic, transactional operations.
-- ============================================================

-- ──────────────────────────────────────────────
-- Helper: Generate PNR code
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_pnr()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  pnr_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    -- Ensure uniqueness
    SELECT EXISTS(SELECT 1 FROM bookings WHERE pnr_code = result) INTO pnr_exists;
    EXIT WHEN NOT pnr_exists;
  END LOOP;

  RETURN result;
END;
$$;

-- ──────────────────────────────────────────────
-- RPC: reserve_seat
-- Atomically reserves a seat and creates a booking
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reserve_seat(
  p_flight_id UUID,
  p_seat_id UUID,
  p_user_id UUID,
  p_full_name VARCHAR,
  p_passport_no VARCHAR,
  p_nationality VARCHAR,
  p_dob DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seat RECORD;
  v_flight RECORD;
  v_pnr VARCHAR(6);
  v_total_price NUMERIC;
  v_booking_id UUID;
BEGIN
  -- 1. Lock the seat row to prevent race conditions
  SELECT * INTO v_seat
  FROM seats
  WHERE id = p_seat_id AND flight_id = p_flight_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seat not found for this flight';
  END IF;

  IF NOT v_seat.is_available THEN
    RAISE EXCEPTION 'Seat is no longer available. Please select a different seat.';
  END IF;

  -- 2. Verify the flight exists and is bookable
  SELECT * INTO v_flight
  FROM flights
  WHERE id = p_flight_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Flight not found';
  END IF;

  IF v_flight.status != 'scheduled' AND v_flight.status != 'delayed' THEN
    RAISE EXCEPTION 'This flight is not available for booking (status: %)', v_flight.status;
  END IF;

  IF v_flight.departs_at <= now() THEN
    RAISE EXCEPTION 'Cannot book a flight that has already departed';
  END IF;

  -- 3. Calculate total price
  v_total_price := v_flight.base_price + v_seat.extra_fee;

  -- 4. Generate unique PNR
  v_pnr := generate_pnr();

  -- 5. Mark seat as unavailable
  UPDATE seats SET is_available = false WHERE id = p_seat_id;

  -- 6. Create booking
  INSERT INTO bookings (user_id, flight_id, seat_id, status, total_price, pnr_code)
  VALUES (p_user_id, p_flight_id, p_seat_id, 'confirmed', v_total_price, v_pnr)
  RETURNING id INTO v_booking_id;

  -- 7. Create passenger record
  INSERT INTO passengers (booking_id, full_name, passport_no, nationality, dob)
  VALUES (v_booking_id, p_full_name, p_passport_no, p_nationality, p_dob);

  -- 8. Return result
  RETURN json_build_object(
    'booking_id', v_booking_id,
    'pnr_code', v_pnr,
    'total_price', v_total_price
  );
END;
$$;

-- ──────────────────────────────────────────────
-- RPC: cancel_booking
-- Atomically cancels a booking and releases the seat
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking RECORD;
  v_flight RECORD;
BEGIN
  -- 1. Lock the booking row
  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or you do not have permission to cancel it';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'This booking has already been cancelled';
  END IF;

  -- 2. Check cancellation window (must be > 2 hours before departure)
  SELECT * INTO v_flight
  FROM flights
  WHERE id = v_booking.flight_id;

  IF v_flight.departs_at - INTERVAL '2 hours' <= now() THEN
    RAISE EXCEPTION 'Cannot cancel within 2 hours of departure. Departure: %, Current: %',
      v_flight.departs_at, now();
  END IF;

  -- 3. Cancel the booking
  UPDATE bookings SET status = 'cancelled' WHERE id = p_booking_id;

  -- 4. Release the seat
  UPDATE seats SET is_available = true WHERE id = v_booking.seat_id;
END;
$$;

-- ──────────────────────────────────────────────
-- RPC: reschedule_booking
-- Atomically reschedules a booking to a new flight/seat
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reschedule_booking(
  p_booking_id UUID,
  p_user_id UUID,
  p_new_flight_id UUID,
  p_new_seat_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_booking RECORD;
  v_new_seat RECORD;
  v_new_flight RECORD;
  v_new_pnr VARCHAR(6);
  v_new_total NUMERIC;
  v_new_booking_id UUID;
  v_fee NUMERIC := 500; -- Reschedule fee in INR
BEGIN
  -- 1. Lock old booking
  SELECT * INTO v_old_booking
  FROM bookings
  WHERE id = p_booking_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or you do not have permission';
  END IF;

  IF v_old_booking.status != 'confirmed' THEN
    RAISE EXCEPTION 'Only confirmed bookings can be rescheduled (current status: %)', v_old_booking.status;
  END IF;

  -- 2. Lock new seat
  SELECT * INTO v_new_seat
  FROM seats
  WHERE id = p_new_seat_id AND flight_id = p_new_flight_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'New seat not found for the selected flight';
  END IF;

  IF NOT v_new_seat.is_available THEN
    RAISE EXCEPTION 'The selected seat on the new flight is no longer available';
  END IF;

  -- 3. Verify new flight
  SELECT * INTO v_new_flight
  FROM flights
  WHERE id = p_new_flight_id;

  IF v_new_flight.departs_at <= now() THEN
    RAISE EXCEPTION 'Cannot reschedule to a flight that has already departed';
  END IF;

  -- 4. Calculate new total (new flight price + seat fee + reschedule fee)
  v_new_total := v_new_flight.base_price + v_new_seat.extra_fee + v_fee;

  -- 5. Generate new PNR
  v_new_pnr := generate_pnr();

  -- 6. Release old seat
  UPDATE seats SET is_available = true WHERE id = v_old_booking.seat_id;

  -- 7. Mark old booking as rescheduled
  UPDATE bookings SET status = 'rescheduled' WHERE id = p_booking_id;

  -- 8. Reserve new seat
  UPDATE seats SET is_available = false WHERE id = p_new_seat_id;

  -- 9. Create new booking
  INSERT INTO bookings (user_id, flight_id, seat_id, status, total_price, pnr_code)
  VALUES (p_user_id, p_new_flight_id, p_new_seat_id, 'confirmed', v_new_total, v_new_pnr)
  RETURNING id INTO v_new_booking_id;

  -- 10. Copy passenger to new booking
  INSERT INTO passengers (booking_id, full_name, passport_no, nationality, dob)
  SELECT v_new_booking_id, full_name, passport_no, nationality, dob
  FROM passengers
  WHERE booking_id = p_booking_id
  LIMIT 1;

  -- 11. Record reschedule
  INSERT INTO reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (v_new_booking_id, v_old_booking.flight_id, p_new_flight_id, v_fee);

  -- 12. Return result
  RETURN json_build_object(
    'new_booking_id', v_new_booking_id,
    'new_pnr_code', v_new_pnr,
    'fee_charged', v_fee
  );
END;
$$;
