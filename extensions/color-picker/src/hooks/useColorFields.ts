import { useState } from "react";

/**
 * Custom hook to manage the number of color fields in a dynamic form.
 *
 * This hook provides a simple interface for managing how many color input fields
 * should be displayed in the palette form. It eliminates the complexity of managing
 * separate arrays and IDs by using a simple count-based approach.
 *
 * **Responsibilities:**
 * - Tracks the number of color fields to display
 * - Provides functions to add/remove color fields
 * - Initializes count from draft values when resuming form editing
 * - Ensures at least one color field is always present (UX requirement)
 *
 * **Simplified Architecture:**
 * - No separate arrays or complex ID management
 * - Color fields are generated dynamically based on count
 * - All color values live in form state (single source of truth)
 *
 * @param draftValues - Optional saved form values to restore previous session state.
 *                     When provided, the hook will initialize the correct number of
 *                     color fields based on existing color entries in the draft.
 *
 * @returns An object containing:
 * - `colorFieldCount`: Number of color fields to render
 * - `addColorField`: Function to increment the color field count
 * - `removeColorField`: Function to decrement the color field count (maintains minimum of 1)
 * - `resetColorFields`: Function to reset to initial state with one color field
 *
 * @example
 * ```typescript
 * // Basic usage in a component
 * const { colorFieldCount, addColorField, removeColorField, resetColorFields } = useColorFields();
 *
 * // With draft values (form restoration)
 * const { colorFieldCount, addColorField, removeColorField } = useColorFields(savedDraftValues);
 *
 * // Rendering color fields
 * {Array.from({ length: colorFieldCount }, (_, index) => (
 *   <Form.TextField
 *     key={index}
 *     id={`color${index + 1}`}
 *     title={`Color ${index + 1}`}
 *   />
 * ))}
 * ```
 */
export function useColorFields(initialColorFieldCount: number = 1) {
  // Initialize color field count based on draft values or default to 1
  const [colorFieldCount, setColorFieldCount] = useState<number>(initialColorFieldCount);

  /**
   * Adds a new color field by incrementing the count.
   */
  const addColorField = () => {
    setColorFieldCount((prev) => prev + 1);
  };

  /**
   * Removes a color field by decrementing the count.
   * Enforces the business rule that at least one color field must remain.
   */
  const removeColorField = () => {
    setColorFieldCount((prev) => Math.max(1, prev - 1));
  };

  /**
   * Resets the color fields to initial state (single field).
   * Useful for "clear all" functionality or form reset operations.
   */
  const resetColorFields = () => {
    setColorFieldCount(1);
  };

  return {
    colorFieldCount,
    addColorField,
    removeColorField,
    resetColorFields,
  };
}
