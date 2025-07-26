import { Form, Icon } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { useMemo } from "react";
import { ColorFieldsSection } from "./components/ColorFieldsSection";
import { ColorPaletteActions } from "./components/ColorPaletteActions";
import { KeywordsSection } from "./components/KeywordsSection";
import { CLEAR_FORM_VALUES } from "./constants";
import { useColorFields } from "./hooks/useColorFields";
import { useKeywords } from "./hooks/useKeywords";
import { usePaletteSubmission } from "./hooks/usePaletteSubmission";
import { useRealTimeFocus } from "./hooks/useRealTimeFocus";
import { PaletteFormFields, PaletteFormProps } from "./types";
import { createValidationRules } from "./utils/formValidation";

export default function Command(props: PaletteFormProps) {
  const { draftValues } = props;
  const selectedColors = props.launchContext?.selectedColors || [];
  const AIprompt = props.launchContext?.text || "";

  // Check if we're in editing mode (nested context)
  // isEditing is also used to detect if we're in a nested context where we shouldn't navigate
  // This includes editing (Action.Push from view-palettes) but NOT organize-colors/generate-colors
  const isEditing = Boolean(draftValues?.editingPaletteId);

  // Initialize form fields with proper priority: 1. draftValues, 2. selectedColors, 3. defaults
  // Memoized to prevent unnecessary recalculations on re-renders
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
  const initialColorFieldCount = Object.keys(initialValues).filter((key) => key.startsWith("color")).length;

  // === State Management Hooks ===
  // Each hook has a single responsibility following React best practices

  /** Manages dynamic color field state */
  const { colorFieldCount, addColorField, removeColorField, resetColorFields } = useColorFields(initialColorFieldCount);

  /** Handles keyword parsing and management */
  const { keywords, updateKeywords } = useKeywords(draftValues);

  /** Encapsulates palette submission logic */
  const { submitPalette } = usePaletteSubmission();

  /** Tracks currently focused form field and manages draft restoration */
  const { currentFocusedField, createFocusHandlers, setFocusedField } = useRealTimeFocus();

  // === Form Management ===
  // Raycast's form hook with custom validation and submission handling
  const {
    handleSubmit,
    itemProps,
    reset,
    setValue: setFormValues,
    values,
  } = useForm<PaletteFormFields>({
    async onSubmit(values) {
      // Submit palette with context information to prevent navigation loops
      // IMPORTANT: Manually add editingPaletteId if we're in editing mode
      const submissionValues = {
        ...values,
        ...(isEditing && draftValues?.editingPaletteId ? { editingPaletteId: draftValues.editingPaletteId } : {}),
      };

      await submitPalette({
        formValues: submissionValues,
        colorCount: colorFieldCount,
        onSubmit: handleClearForm,
        isNestedContext: isEditing, // Prevent navigation loops when editing from view-palettes
      });
    },
    validation: createValidationRules(colorFieldCount),
    initialValues,
  });

  // === Helper Functions ===

  /**
   * Calculates which field should get autoFocus for draft restoration.
   * Determines the next logical field to focus based on existing draft values.
   */
  const getAutoFocusField = (): string | null => {
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
  };

  const autoFocusField = getAutoFocusField();

  // === Local Event Handlers ===

  /**
   * Resets the entire form to its initial state.
   */
  const handleClearForm = () => {
    resetColorFields();
    reset(CLEAR_FORM_VALUES);
  };

  // === Local Event Handlers ===

  /**
   * Adds a new color field and focuses on it for immediate input.
   *
   * **Race Condition Prevention:** Uses pre-calculated field ID to avoid race conditions
   * with React state updates. React state updates are asynchronous, so if we calculated
   * the field ID after calling addColorField(), we might read the old colorFieldCount value.
   *
   * **Example of the race condition:**
   * ```tsx
   * // ❌ PROBLEMATIC: Race condition
   * addColorField(); // Triggers setColorFieldCount(3 => 4)
   * // colorFieldCount might still be 3 here (old value)
   * const fieldId = `color${colorFieldCount + 1}`; // Could be "color4" instead of "color4"
   *
   * // ✅ FIXED: Pre-calculate before state update
   * const fieldId = `color${colorFieldCount + 1}`; // Always correct
   * addColorField(); // State update happens after calculation
   * ```
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

  return (
    <Form
      actions={
        <ColorPaletteActions
          handleSubmit={handleSubmit}
          addColor={handleAddColorField}
          removeColor={handleRemoveColorField}
          clearForm={handleClearForm}
          colorFieldCount={colorFieldCount}
        />
      }
      enableDrafts={!isEditing} // Disable drafts in nested forms (when editing)
    >
      <Form.Description text={isEditing ? "Edit Color Palette" : "Create a new Color Palette"} />
      <Form.TextField
        {...itemProps.name}
        title="Name*"
        info="Insert the name of your Color Palette"
        {...createFocusHandlers("name")}
      />
      <Form.TextArea
        {...itemProps.description}
        title="Description"
        info="Insert a short description (optional). It should be under 50 characters."
        {...createFocusHandlers("description")}
      />
      <Form.Dropdown {...itemProps.mode} title="Mode*" {...createFocusHandlers("mode")}>
        <Form.Dropdown.Item value="light" title="Light Color Palette" icon={Icon.Sun} />
        <Form.Dropdown.Item value="dark" title="Dark Color Palette" icon={Icon.Moon} />
      </Form.Dropdown>
      <KeywordsSection
        keywords={keywords}
        itemProps={itemProps}
        updateKeywords={handleUpdateKeywords}
        createFocusHandlers={createFocusHandlers}
      />
      <ColorFieldsSection
        colorFieldCount={colorFieldCount}
        itemProps={itemProps}
        autoFocusField={autoFocusField}
        currentFocusedField={currentFocusedField}
        createFocusHandlers={createFocusHandlers}
      />
    </Form>
  );
}
