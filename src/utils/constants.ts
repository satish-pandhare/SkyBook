// ──────────────────────────────────────────────
// Seat Classes
// ──────────────────────────────────────────────

export const SEAT_CLASSES = ["economy", "business", "first"] as const;
export type SeatClass = (typeof SEAT_CLASSES)[number];

export const SEAT_CLASS_LABELS: Record<SeatClass, string> = {
  economy: "Economy",
  business: "Business",
  first: "First Class",
};

export const SEAT_CLASS_COLORS: Record<SeatClass, string> = {
  economy: "bg-sky-500",
  business: "bg-amber-500",
  first: "bg-violet-500",
};

// ──────────────────────────────────────────────
// Booking Status
// ──────────────────────────────────────────────

export const BOOKING_STATUSES = ["confirmed", "cancelled", "rescheduled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  rescheduled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

// ──────────────────────────────────────────────
// Flight Status
// ──────────────────────────────────────────────

export const FLIGHT_STATUSES = ["scheduled", "delayed", "cancelled", "completed"] as const;
export type FlightStatus = (typeof FLIGHT_STATUSES)[number];

export const FLIGHT_STATUS_COLORS: Record<FlightStatus, string> = {
  scheduled: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  delayed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// ──────────────────────────────────────────────
// Seat Map Layout
// ──────────────────────────────────────────────

export const SEAT_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  SELECTED: "selected",
  YOURS: "yours",
} as const;

export type SeatStatus = (typeof SEAT_STATUS)[keyof typeof SEAT_STATUS];

export const SEAT_STATUS_COLORS: Record<SeatStatus, string> = {
  available: "bg-slate-700 hover:bg-slate-600 border-slate-600",
  occupied: "bg-slate-800/50 border-slate-700/50 cursor-not-allowed opacity-40",
  selected: "bg-sky-500 border-sky-400 ring-2 ring-sky-400/50",
  yours: "bg-emerald-500 border-emerald-400",
};

// ──────────────────────────────────────────────
// Routes & Airports
// ──────────────────────────────────────────────

export const AIRPORTS = {
  DEL: { code: "DEL", city: "New Delhi", name: "Indira Gandhi International" },
  BOM: { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj" },
  BLR: { code: "BLR", city: "Bengaluru", name: "Kempegowda International" },
  HYD: { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International" },
  CCU: { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose" },
  MAA: { code: "MAA", city: "Chennai", name: "Chennai International" },
} as const;

export type AirportCode = keyof typeof AIRPORTS;

export const AIRPORT_OPTIONS = Object.values(AIRPORTS).map((a) => ({
  value: a.code,
  label: `${a.city} (${a.code})`,
}));

// ──────────────────────────────────────────────
// Booking Flow Steps
// ──────────────────────────────────────────────

export const BOOKING_STEPS = ["search", "seats", "passenger", "confirmation"] as const;
export type BookingStep = (typeof BOOKING_STEPS)[number];

// ──────────────────────────────────────────────
// Cancellation
// ──────────────────────────────────────────────

export const MIN_HOURS_BEFORE_CANCELLATION = 2;

// ──────────────────────────────────────────────
// Reschedule fee
// ──────────────────────────────────────────────

export const RESCHEDULE_FEE = 500; // INR
