/**
 * Date formatting utilities for the Color Palette Storage extension.
 *
 * This module provides consistent date formatting across the application
 * for displaying creation timestamps and other date-related information.
 */

/**
 * Formats an ISO date string into a user-friendly display format.
 *
 * Converts ISO timestamp strings (typically from `new Date().toISOString()`)
 * into a localized format suitable for display in the UI. Uses DD/MM/YYYY HH:MM
 * format which is commonly understood and space-efficient for list displays.
 *
 * **Format:** DD/MM/YYYY HH:MM
 * - DD: Two-digit day (01-31)
 * - MM: Two-digit month (01-12)
 * - YYYY: Four-digit year
 * - HH: Two-digit hours in 24-hour format (00-23)
 * - MM: Two-digit minutes (00-59)
 *
 * @param dateString - ISO date string to format (e.g., "2025-01-19T10:30:00.000Z")
 * @returns Formatted date string ready for display
 *
 * @example
 * ```typescript
 * formatDate("2025-01-19T10:30:00.000Z");
 * // Returns: "19/01/2025 10:30"
 *
 * formatDate("2025-12-31T23:59:59.999Z");
 * // Returns: "31/12/2025 23:59"
 * ```
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  // Helper function to ensure two-digit formatting with leading zeros
  const pad = (n: number) => n.toString().padStart(2, "0");

  // Extract date components
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // getMonth() is 0-indexed
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  // Return formatted string in DD/MM/YYYY HH:MM format
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
