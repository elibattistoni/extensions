/**
 * Form helper utilities for the Color Palette Storage extension.
 *
 * This module provides utility functions for form data transformation and manipulation.
 * These pure functions help convert between different data representations used throughout
 * the application (form state vs storage format vs UI state).
 */

import { PaletteFormFields } from "../types";

/**
 * Extracts non-empty color values from form data based on the number of color fields.
 *
 * This function takes the form values and colorCount, then extracts all non-empty
 * color values from the form fields. It filters out any empty strings to ensure
 * only valid colors are included in the final palette.
 *
 * @param values - The complete form values object containing all form fields
 * @param colorCount - The number of color fields in the form
 * @returns Array of non-empty color value strings
 *
 * @example
 * ```typescript
 * const formData = { name: "Ocean", color1: "#1E90FF", color2: "", color3: "#87CEEB" };
 * const result = extractColorValues(formData, 3);
 * // Returns: ["#1E90FF", "#87CEEB"] (empty color2 filtered out)
 * ```
 */
export function extractColorValues(values: PaletteFormFields, colorCount: number): string[] {
  return Array.from(
    { length: colorCount },
    (_, index) => values[`color${index + 1}` as keyof PaletteFormFields],
  ).filter(Boolean) as string[];
}
