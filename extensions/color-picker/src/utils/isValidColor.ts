/**
 * Color validation utilities for the Color Palette Storage extension.
 *
 * This module provides robust color format validation supporting multiple
 * common color representations used in web development and design tools.
 */

/**
 * Validates whether a string represents a valid color in supported formats.
 *
 * Supports the most common color formats used in web development:
 * - Hex: #RGB or #RRGGBB (case-insensitive)
 * - RGB: rgb(r, g, b) with values 0-255
 * - RGBA: rgba(r, g, b, a) with RGB 0-255 and alpha 0-1
 *
 * **Validation Features:**
 * - Handles whitespace and case variations
 * - Validates numeric ranges for RGB values (0-255)
 * - Validates alpha channel range (0-1, including decimals)
 * - Rejects malformed or empty inputs
 * - Supports both 3-digit and 6-digit hex formats
 *
 * @param color - The color string to validate
 * @returns True if the color is in a valid format, false otherwise
 *
 * @example
 * ```typescript
 * isValidColor("#FF5733");           // true (hex)
 * isValidColor("#f57");              // true (short hex)
 * isValidColor("rgb(255, 87, 51)");  // true (rgb)
 * isValidColor("rgba(255, 87, 51, 0.8)"); // true (rgba)
 * isValidColor("invalid");           // false
 * isValidColor("");                  // false
 * isValidColor("rgb(256, 0, 0)");    // false (out of range)
 * ```
 */
export const isValidColor = (color: string): boolean => {
  // Basic input validation
  if (!color || typeof color !== "string") return false;

  const trimmedColor = color.trim();
  if (!trimmedColor) return false;

  // Regular expressions for supported color formats
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbPattern = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const rgbaPattern = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;

  // Validate hex format (both #RGB and #RRGGBB)
  if (hexPattern.test(trimmedColor)) return true;

  // Validate RGB format with range checking (0-255 for each channel)
  const rgbMatch = trimmedColor.match(rgbPattern);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return [r, g, b].every((val) => {
      const num = parseInt(val, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Validate RGBA format with range checking (RGB: 0-255, Alpha: 0-1)
  const rgbaMatch = trimmedColor.match(rgbaPattern);
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    const rgbValid = [r, g, b].every((val) => {
      const num = parseInt(val, 10);
      return num >= 0 && num <= 255;
    });
    const alphaValid = parseFloat(a) >= 0 && parseFloat(a) <= 1;
    return rgbValid && alphaValid;
  }

  // No valid format matched
  return false;
};
