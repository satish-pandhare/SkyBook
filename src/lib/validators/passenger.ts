import { z } from "zod";

export const passengerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  passportNo: z
    .string()
    .min(5, "Passport number must be at least 5 characters")
    .max(20, "Passport number is too long")
    .regex(/^[A-Z0-9]+$/, "Passport number must be uppercase alphanumeric"),
  nationality: z
    .string()
    .min(2, "Nationality is required")
    .max(50, "Nationality is too long"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (val) => {
        const age = (Date.now() - new Date(val).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 0 && age <= 150;
      },
      "Please enter a valid date of birth"
    ),
});

export type PassengerFormData = z.infer<typeof passengerSchema>;
