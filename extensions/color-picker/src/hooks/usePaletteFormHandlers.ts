import { CLEAR_FORM_VALUES } from "../constants";
import { KeywordUpdateResult, PaletteFormFields } from "../types";

/**
 * Custom hook for palette form event handlers.
 * Encapsulates all form interaction logic with proper state management.
 */
export function usePaletteFormHandlers(
  colorFieldCount: number,
  addColorField: () => void,
  removeColorField: () => void,
  resetColorFields: () => void,
  setFormValues: (field: keyof PaletteFormFields, value: any) => void,
  reset: (values: PaletteFormFields) => void,
  setFocusedField: (fieldId: string) => void,
  updateKeywords: (keywordsText: string) => Promise<KeywordUpdateResult>,
) {
  /**
   * Resets the entire form to its initial state.
   */
  const handleClearForm = () => {
    resetColorFields();
    reset(CLEAR_FORM_VALUES);
  };

  /**
   * Adds a new color field and focuses on it for immediate input.
   *
   * **Race Condition Prevention:** Uses pre-calculated field ID to avoid race conditions
   * with React state updates. React state updates are asynchronous, so if we calculated
   * the field ID after calling addColorField(), we might read the old colorFieldCount value.
   */
  const handleAddColorField = () => {
    // Calculate the new field ID before state update to avoid race conditions
    const newColorFieldId = `color${colorFieldCount + 1}`;

    // Add the new color field (async state update)
    addColorField();

    // Focus on the newly added color field with a delay to ensure DOM is updated
    setTimeout(() => {
      setFocusedField(newColorFieldId);
    }, 50); // Sufficient delay for state update and DOM rendering
  };

  /**
   * Removes the last color field and clears its form value.
   * Ensures complete cleanup when removing color fields and sets focus to the new last color field.
   */
  const handleRemoveColorField = () => {
    if (colorFieldCount > 1) {
      // Clear the value of the last color field before removing it
      const lastColorField = `color${colorFieldCount}` as keyof PaletteFormFields;
      setFormValues(lastColorField, "");

      // Remove the color field from the UI
      removeColorField();

      // Focus on the new last color field after removal
      const newLastColorField = `color${colorFieldCount - 1}`;
      setFocusedField(newLastColorField);
    }
  };

  /**
   * Handles keyword input parsing and form state updates.
   */
  const handleUpdateKeywords = async (keywordsText: string) => {
    const result = await updateKeywords(keywordsText);
    setFormValues("keywords", (prev: string[]) => [...prev, ...result.validKeywords]);
    return result;
  };

  return {
    handleClearForm,
    handleAddColorField,
    handleRemoveColorField,
    handleUpdateKeywords,
  };
}
