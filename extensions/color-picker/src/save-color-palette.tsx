import { Form, Icon } from "@raycast/api";
import { useForm } from "@raycast/utils";
import { ColorFieldsSection } from "./components/ColorFieldsSection";
import { KeywordsSection } from "./components/KeywordsSection";
import { SavePaletteActions } from "./components/SavePaletteActions";
import { CLEAR_FORM_VALUES } from "./constants";
import { useColorFields } from "./hooks/useColorFields";
import { useKeywords } from "./hooks/useKeywords";
import { usePaletteFormHandlers } from "./hooks/usePaletteFormHandlers";
import { usePaletteFormInitialization } from "./hooks/usePaletteFormInitialization";
import { usePaletteSubmission } from "./hooks/usePaletteSubmission";
import { useRealTimeFocus } from "./hooks/useRealTimeFocus";
import { PaletteFormFields, PaletteFormProps } from "./types";
import { createValidationRules } from "./utils/formValidation";

export default function Command(props: PaletteFormProps) {
  const { draftValues } = props;
  const selectedColors = props.launchContext?.selectedColors || [];
  const AIprompt = props.launchContext?.text || "";

  // Check if we're in editing mode (nested context)
  const isEditing = Boolean(draftValues?.editingPaletteId);

  // === Form Initialization ===
  /** Handles form initialization logic */
  const { initialValues, initialColorFieldCount, autoFocusField } = usePaletteFormInitialization(
    draftValues,
    selectedColors,
    AIprompt,
    1, // Will be updated below
  );

  // === State Management Hooks ===
  /** Manages dynamic color field state */
  const { colorFieldCount, addColorField, removeColorField, resetColorFields } = useColorFields(initialColorFieldCount);

  /** Handles keyword parsing and management */
  const { keywords, updateKeywords } = useKeywords(draftValues);

  /** Encapsulates palette submission logic */
  const { submitPalette } = usePaletteSubmission();

  /** Tracks currently focused form field and manages draft restoration */
  const { currentFocusedField, createFocusHandlers, setFocusedField } = useRealTimeFocus();

  // === Form Management ===
  const {
    handleSubmit,
    itemProps,
    reset,
    setValue: setFormValues,
    values,
  } = useForm<PaletteFormFields>({
    async onSubmit(values) {
      const submissionValues = {
        ...values,
        ...(isEditing && draftValues?.editingPaletteId ? { editingPaletteId: draftValues.editingPaletteId } : {}),
      };

      await submitPalette({
        formValues: submissionValues,
        colorCount: colorFieldCount,
        onSubmit: () => {
          resetColorFields();
          reset(CLEAR_FORM_VALUES);
        },
        isNestedContext: isEditing,
      });
    },
    validation: createValidationRules(colorFieldCount),
    initialValues,
  });

  /** Form event handlers */
  const { handleClearForm, handleAddColorField, handleRemoveColorField, handleUpdateKeywords } = usePaletteFormHandlers(
    colorFieldCount,
    addColorField,
    removeColorField,
    resetColorFields,
    setFormValues,
    reset,
    setFocusedField,
    updateKeywords,
  );

  return (
    <Form
      actions={
        <SavePaletteActions
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
