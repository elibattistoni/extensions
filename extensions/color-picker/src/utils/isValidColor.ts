/**
 * Color validation utilities for the Color Palette Storage extension.
 *
 * This module provides robust HEX color format validation for palette creation.
 * Only HEX colors are supported to ensure consistency across the application.
 */

/**
 * Validates whether a string represents a valid HEX color format.
 *
 * Supports standard HEX color formats used in web development:
 * - Hex: #RGB or #RRGGBB (case-insensitive)
 *
 * **Validation Features:**
 * - Handles whitespace and case variations
 * - Supports both 3-digit and 6-digit hex formats
 * - Rejects malformed or empty inputs
 * - Strict validation ensuring only valid hex characters (0-9, A-F)
 *
 * @param color - The color string to validate
 * @returns True if the color is in a valid HEX format, false otherwise
 *
 * @example
 * ```typescript
 * isValidColor("#FF5733");           // true (6-digit hex)
 * isValidColor("#f57");              // true (3-digit hex)
 * isValidColor("#FFF");              // true (3-digit hex)
 * isValidColor("FF5733");            // false (missing #)
 * isValidColor("#GG5733");           // false (invalid hex characters)
 * isValidColor("rgb(255, 87, 51)");  // false (not hex format)
 * isValidColor("");                  // false (empty)
 * ```
 */
export const isValidColor = (color: string): boolean => {
  // Basic input validation
  if (!color || typeof color !== "string") return false;

  const trimmedColor = color.trim();
  if (!trimmedColor) return false;

  // Regular expression for HEX color format only
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  // Validate hex format (both #RGB and #RRGGBB)
  return hexPattern.test(trimmedColor);
};
