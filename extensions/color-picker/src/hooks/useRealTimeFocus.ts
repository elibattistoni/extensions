import { useCallback, useRef, useState } from "react";

/**
 * Custom hook for tracking the currently focused form field in real-time.
 *
 * This hook provides real-time tracking of which form field is currently focused
 * as the user navigates through the form. Unlike draft restoration focus logic,
 * this tracks actual user interaction and updates dynamically.
 *
 * **Key Features:**
 * - Tracks focus changes in real-time as user navigates
 * - Works with any form field (name, description, color1, color2, etc.)
 * - Updates immediately when user clicks or tabs between fields
 * - Provides both the current focused field and focus change handlers
 * - Independent of draft values or form restoration
 *
 * **Use Cases:**
 * - Determining which color field is active for color picker operations
 * - Providing context-sensitive actions based on current field
 * - Real-time UI updates based on focus state
 * - Debugging and development logging
 *
 * @returns Object containing:
 * - `currentFocusedField`: String ID of currently focused field or null
 * - `setFocusedField`: Function to manually set the focused field
 * - `createFocusHandlers`: Function to create onFocus/onBlur handlers for form fields
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { currentFocusedField, createFocusHandlers } = useRealTimeFocus();
 *
 * // Check if a color field is focused
 * const isColorFieldFocused = currentFocusedField?.startsWith('color');
 *
 * // Create handlers for a form field
 * const colorFieldHandlers = createFocusHandlers('color1');
 *
 * // Use with Raycast Form.TextField
 * <Form.TextField
 *   {...itemProps.color1}
 *   onFocus={colorFieldHandlers.onFocus}
 *   onBlur={colorFieldHandlers.onBlur}
 * />
 * ```
 */
export function useRealTimeFocus() {
  // Track the currently focused field ID
  const [currentFocusedField, setCurrentFocusedField] = useState<string | null>(null);
  // Track the last focused field to maintain context when actions panel opens
  const [lastFocusedField, setLastFocusedField] = useState<string | null>(null);

  // Use ref to avoid stale closures in event handlers
  const focusedFieldRef = useRef<string | null>(null);

  /**
   * Updates the focused field state.
   * Uses both state and ref to ensure handlers have current value.
   */
  const setFocusedField = useCallback((fieldId: string | null) => {
    // If we're setting a real field (not null), update last focused
    if (fieldId) {
      setLastFocusedField(fieldId);
    }

    setCurrentFocusedField(fieldId);
    focusedFieldRef.current = fieldId;
  }, []);

  // Get the effective focused field (current if available, otherwise last)
  const effectiveFocusedField = currentFocusedField || lastFocusedField;

  /**
   * Creates onFocus and onBlur handlers for a specific form field.
   *
   * @param fieldId - The ID of the form field (e.g., "color1", "name", "description")
   * @returns Object with onFocus and onBlur handlers
   */
  const createFocusHandlers = useCallback(
    (fieldId: string) => {
      return {
        onFocus: () => {
          setFocusedField(fieldId);
        },
        onBlur: () => {
          // Only clear if this field was actually focused
          // Prevents race conditions when quickly switching between fields
          if (focusedFieldRef.current === fieldId) {
            setFocusedField(null);
          }
        },
      };
    },
    [setFocusedField],
  );

  return {
    currentFocusedField,
    effectiveFocusedField,
    setFocusedField,
    createFocusHandlers,
  };
}
