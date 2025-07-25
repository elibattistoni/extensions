/**
 * ColorPaletteActions Component
 *
 * Action panel providing form actions with keyboard shortcuts for color palette creation.
 * Organizes actions logically for efficient workflow management.
 */

import { Action, ActionPanel } from "@raycast/api";

/**
 * Props interface for the ColorPaletteActions component.
 */
interface ColorPaletteActionsProps {
  /** Form submission handler */
  handleSubmit: (values: any) => boolean | void | Promise<boolean | void>;
  /** Function to add a new color field */
  addColor: () => void;
  /** Function to remove the last color field */
  removeColor: () => void;
  /** Function to reset the entire form */
  clearForm: () => void;
  /** Current number of color fields */
  colorFieldCount: number;
}

/**
 * Renders action panel with form actions and keyboard shortcuts.
 *
 * @param props - Component properties containing action handlers and state
 */
export function ColorPaletteActions({
  handleSubmit,
  addColor,
  removeColor,
  clearForm,
  colorFieldCount,
}: ColorPaletteActionsProps) {
  return (
    <ActionPanel>
      {/* Primary action: Submit form to save palette */}
      <Action.SubmitForm onSubmit={handleSubmit} />

      {/* Color field management actions */}
      <Action title="Add New Color Field" onAction={addColor} shortcut={{ modifiers: ["cmd"], key: "n" }} />

      {/* Remove action only available when multiple color fields exist */}
      {colorFieldCount > 1 && (
        <Action title="Remove Last Color" onAction={removeColor} shortcut={{ modifiers: ["cmd"], key: "backspace" }} />
      )}

      {/* Form management actions */}
      <Action title="Clear Form" onAction={clearForm} shortcut={{ modifiers: ["cmd", "shift"], key: "r" }} />
    </ActionPanel>
  );
}
