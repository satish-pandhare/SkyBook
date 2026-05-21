/**
 * Format a date string to a human-readable format.
 * @example formatDate("2024-12-25T10:30:00Z") → "Dec 25, 2024"
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date to time-only.
 * @example formatTime("2024-12-25T10:30:00Z") → "10:30 AM"
 */
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/**
 * Format a date with both date and time.
 * @example formatDateTime("2024-12-25T10:30:00Z") → "Dec 25, 2024, 10:30 AM"
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/**
 * Format a number as Indian Rupees.
 * @example formatCurrency(12500) → "₹12,500"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate flight duration between two timestamps.
 * @example formatDuration("2024-12-25T10:00:00Z", "2024-12-25T12:30:00Z") → "2h 30m"
 */
export function formatDuration(departure: string | Date, arrival: string | Date): string {
  const diffMs = new Date(arrival).getTime() - new Date(departure).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Generate a 6-character alphanumeric PNR code.
 * Uses crypto for better randomness in production.
 */
export function generatePNR(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

/**
 * Format a date to YYYY-MM-DD for input[type=date].
 */
export function toDateInputValue(date: Date): string {
  return date.toISOString().split("T")[0];
}
