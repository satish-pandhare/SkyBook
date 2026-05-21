import { z } from "zod";

const uuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const bookingSchema = z.object({
  flightId: z.string().regex(uuidLike, "Invalid flight ID"),
  seatId: z.string().uuid("Invalid seat ID"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  passportNo: z
    .string()
    .min(5, "Passport number must be at least 5 characters")
    .max(20, "Passport number is too long"),
  nationality: z
    .string()
    .min(2, "Nationality is required"),
  dob: z
    .string()
    .min(1, "Date of birth is required"),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
