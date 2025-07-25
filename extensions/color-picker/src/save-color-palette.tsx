import { Form, Icon } from "@raycast/api";
import { useForm } from "@raycast/utils";
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

  // Initialize form fields with proper priority: 1. draftValues, 2. selectedColors, 3. defaults
  const initializeFormValues = (): PaletteFormFields => {
    // Start with a fresh copy of default values to avoid mutations
    const initialValues: PaletteFormFields = { ...CLEAR_FORM_VALUES };

    // Priority 1: Use draft values if available (highest priority)
    if (draftValues) {
      // Safely copy all draft values
      Object.assign(initialValues, draftValues);
      return initialValues;
    }

    // Priority 2: Use selected colors if no draft values
    if (selectedColors.length > 0) {
      // Handle AI prompt for name/description if available
      if (AIprompt) {
        if (AIprompt.length < 16) {
          initialValues.name = AIprompt;
        } else {
          initialValues.description = AIprompt;
        }
      }

      // Set color fields from selected colors
      selectedColors.forEach((color, index) => {
        const colorKey = `color${index + 1}`;
        (initialValues as any)[colorKey] = color.color;
      });

      return initialValues;
    }

    // Priority 3: Return defaults (safety net - should rarely happen)
    return initialValues;
  };

  const initialValues = initializeFormValues();
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
  const { currentFocusedField, effectiveFocusedField, createFocusHandlers, setFocusedField } = useRealTimeFocus();

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
      // Submit palette with simplified object-based API
      await submitPalette({
        formValues: values,
        colorCount: colorFieldCount,
        onSubmit: handleClearForm,
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
   * **Important:** Uses pre-calculated field ID to avoid race conditions with React state updates.
   * The colorFieldCount state may not be updated immediately after addColorField() is called,
   * so we calculate the new field ID synchronously before the state update.
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
    const updatedKeywords = await updateKeywords(keywordsText);
    setFormValues("keywords", (prev: string[]) => [...prev, ...updatedKeywords]);
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
      enableDrafts
    >
      <Form.Description text="Create a new Color Palette" />
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
