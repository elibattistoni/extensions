/**
 * ViewPalettesActions Component
 *
 * Action panel providing palette actions with keyboard shortcuts for color palette management.
 * Organizes actions logically for efficient workflow management.
 */

import { Action, ActionPanel, Icon, LaunchType } from "@raycast/api";
import SaveColorPaletteCommand from "../save-color-palette";
import { PaletteFormData, StoredPalette } from "../types";
import { CopyFormat } from "../utils/copyPalette";

/**
 * Props interface for the ViewPalettesActions component.
 */
interface ViewPalettesActionsProps {
  /** The palette being viewed */
  palette: StoredPalette;
  /** Function to handle copying palette in different formats */
  handleCopyAs: (palette: StoredPalette, format: CopyFormat) => Promise<void>;
  /** Function to delete a palette */
  deletePalette: (paletteId: string, paletteName: string) => Promise<void>;
  /** Function to create edit form data */
  createEditFormData: (palette: StoredPalette) => PaletteFormData;
  /** Function to create duplicate form data */
  createDuplicateFormData: (palette: StoredPalette) => PaletteFormData;
}

export function ViewPalettesActions({
  palette,
  handleCopyAs,
  deletePalette,
  createEditFormData,
  createDuplicateFormData,
}: ViewPalettesActionsProps) {
  return (
    <ActionPanel>
      {/* COPY SUBMENU */}
      <ActionPanel.Submenu
        title="Copy Palette Colors"
        icon={Icon.CopyClipboard}
        shortcut={{ modifiers: ["cmd"], key: "x" }}
      >
        <Action title="Copy as JSON" onAction={() => handleCopyAs(palette, "json")} icon={Icon.CopyClipboard} />
        <Action title="Copy as CSS Classes" onAction={() => handleCopyAs(palette, "css")} icon={Icon.CopyClipboard} />
        <Action
          title="Copy as CSS Variables"
          onAction={() => handleCopyAs(palette, "css-variables")}
          icon={Icon.CopyClipboard}
        />
        <Action title="Copy as Plain Text" onAction={() => handleCopyAs(palette, "txt")} icon={Icon.CopyClipboard} />
        <ActionPanel.Section title="Copy Individual Colors">
          {palette.colors.map((_, idx) => (
            <Action.CopyToClipboard key={idx} title={`Copy Color ${idx + 1}`} content={palette.colors[idx]} />
          ))}
        </ActionPanel.Section>
      </ActionPanel.Submenu>

      <Action.OpenInBrowser
        title="Open in Coolors"
        url={`https://coolors.co/${palette.colors.map((color) => color.replace("#", "")).join("-")}`}
        icon={Icon.Globe}
      />

      {/* EDIT PALETTE */}
      <Action.Push
        title="Edit Palette"
        target={
          <SaveColorPaletteCommand
            launchType={LaunchType.UserInitiated}
            arguments={{}}
            draftValues={createEditFormData(palette)}
          />
        }
        icon={Icon.Pencil}
        shortcut={{ modifiers: ["cmd"], key: "e" }}
      />

      {/* DUPLICATE PALETTE */}
      <Action.Push
        title="Duplicate Palette"
        target={
          <SaveColorPaletteCommand
            launchType={LaunchType.UserInitiated}
            arguments={{}}
            draftValues={createDuplicateFormData(palette)}
          />
        }
        icon={Icon.Duplicate}
        shortcut={{ modifiers: ["cmd"], key: "d" }}
      />

      <Action
        title="Delete Palette"
        onAction={() => deletePalette(palette.id, palette.name)}
        style={Action.Style.Destructive}
        shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
      />
    </ActionPanel>
  );
}
