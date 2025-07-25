/**
 * Form validation utilities for the Color Palette Storage extension.
 *
 * This module provides pure validation functions that can be easily tested
 * and reused across different form contexts. It separates validation logic
 * from UI components for better maintainability and testability.
 */

import { FormValidation } from "@raycast/utils";
import { isValidColor } from "./isValidColor";

/**
 * Creates dynamic validation rules for a palette form based on the number of color fields.
 *
 * This function generates a validation rules object that includes both static validation
 * for name, mode, and description fields, as well as dynamic validation for color fields
 * based on the provided colorCount. The first color field is always required.
 *
 * @param colorCount - The number of color fields in the form
 * @returns Object containing validation rules for all form fields
 *
 * @example
 * ```typescript
 * const rules = createValidationRules(2);
 * // Returns: { name: Function, mode: Required, description: Function, color1: Function, color2: Function }
 * ```
 */
export function createValidationRules(colorCount: number) {
  // Initialize with static field validation rules
  const rules: Record<string, any> = {
    /** Name field validation: required with character limit */
    name: (value: string) => {
      if (!value) {
        return FormValidation.Required;
      }
      if (value.length >= 16) {
        return "Characters limit exceeded. Keep it under 15 characters.";
      }
    },
    /** Mode field validation: required selection */
    mode: FormValidation.Required,
    /** Description field validation: optional with character limit */
    description: (value: string) => {
      if (value && value.length >= 51) {
        return "Characters limit exceeded. Keep it under 50 characters.";
      }
    },
  };

  // Dynamically add validation rules for each color field
  Array.from({ length: colorCount }, (_, index) => {
    const colorKey = `color${index + 1}`;
    if (index === 0) {
      // First color field: required and must be a valid color format
      rules[colorKey] = (value: string) => {
        if (!value) {
          return "At least one color is required";
        }
        if (!isValidColor(value)) {
          return "Please enter a valid color (hex, rgb, or rgba)";
        }
      };
    } else {
      // Additional color fields: optional but must be valid if provided
      rules[colorKey] = (value: string) => {
        if (value && !isValidColor(value)) {
          return "Please enter a valid color (hex, rgb, or rgba)";
        }
      };
    }
  });

  return rules;
}
