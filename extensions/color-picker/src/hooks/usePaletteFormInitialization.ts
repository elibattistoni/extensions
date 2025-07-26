import { useMemo } from "react";
import { CLEAR_FORM_VALUES } from "../constants";
import { ColorItem, PaletteFormFields } from "../types";

/**
 * Custom hook for handling complex palette form initialization logic.
 * Manages priority-based initial value calculation and auto-focus field determination.
 */
export function usePaletteFormInitialization(
  draftValues: PaletteFormFields | undefined,
  selectedColors: ColorItem[],
  AIprompt: string,
  colorFieldCount: number,
) {
  /**
   * Initialize form fields with proper priority: 1. draftValues, 2. selectedColors, 3. defaults
   * Memoized to prevent unnecessary recalculations on re-renders
   */
  const initialValues = useMemo((): PaletteFormFields => {
    // Start with a fresh copy of default values to avoid mutations
    const values: PaletteFormFields = { ...CLEAR_FORM_VALUES };

    // Priority 1: Use draft values if available (highest priority)
    if (draftValues) {
      // Safely copy all draft values
      Object.assign(values, draftValues);
      return values;
    }

    // Priority 2: Use selected colors if no draft values
    if (selectedColors.length > 0) {
      // Handle AI prompt for name/description if available
      if (AIprompt) {
        if (AIprompt.length < 16) {
          values.name = AIprompt;
        } else {
          values.description = AIprompt;
        }
      }

      // Set color fields from selected colors
      selectedColors.forEach((color, index) => {
        const colorKey = `color${index + 1}`;
        // Type assertion is safe here as we know we're setting color field values
        (values as Record<string, any>)[colorKey] = color.color;
      });

      return values;
    }

    // Priority 3: Return defaults (safety net - should rarely happen)
    return values;
  }, [draftValues, selectedColors, AIprompt]);

  /**
   * Calculates which field should get autoFocus for draft restoration.
   * Determines the next logical field to focus based on existing draft values.
   */
  const autoFocusField = useMemo((): string | null => {
    if (!draftValues || Object.keys(draftValues).length === 0) {
      return null;
    }

    const colorKeys = Object.keys(draftValues).filter((key) => key.startsWith("color"));
    const colorFieldsWithValues = colorKeys.filter((key) => draftValues[key as keyof PaletteFormFields]);

    if (colorFieldsWithValues.length > 0) {
      const lastFilledIndex = Math.max(...colorFieldsWithValues.map((key) => parseInt(key.replace("color", ""))));
      const nextFieldIndex = lastFilledIndex + 1;
      return nextFieldIndex <= colorFieldCount ? `color${nextFieldIndex}` : `color${colorFieldCount}`;
    } else {
      return "color1";
    }
  }, [draftValues, colorFieldCount]);

  const initialColorFieldCount = Object.keys(initialValues).filter((key) => key.startsWith("color")).length;

  return {
    initialValues,
    initialColorFieldCount,
    autoFocusField,
  };
}
