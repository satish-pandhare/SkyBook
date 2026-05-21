import { z } from "zod";

export const searchSchema = z.object({
  origin: z
    .string()
    .min(3, "Select an origin airport")
    .max(3, "Invalid airport code"),
  destination: z
    .string()
    .min(3, "Select a destination airport")
    .max(3, "Invalid airport code"),
  date: z
    .string()
    .min(1, "Select a travel date")
    .refine(
      (val) => new Date(val) >= new Date(new Date().toDateString()),
      "Travel date cannot be in the past"
    ),
}).refine(
  (data) => data.origin !== data.destination,
  {
    message: "Origin and destination must be different",
    path: ["destination"],
  }
);

export type SearchFormData = z.infer<typeof searchSchema>;
