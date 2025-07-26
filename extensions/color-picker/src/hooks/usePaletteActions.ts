import { Clipboard, confirmAlert, showToast, Toast } from "@raycast/api";
import { useCallback } from "react";
import { CopyFormat, PaletteActions, PaletteFormData, StoredPalette } from "../types";
import { copyPalette, getFormatDisplayName } from "../utils/copyPalette";

/**
 * Custom hook for palette management actions.
 * Provides all the business logic for viewing, copying, editing, and deleting palettes.
 */
export function usePaletteActions(
  colorPalettes: StoredPalette[] | undefined,
  setColorPalettes: (palettes: StoredPalette[]) => Promise<void>,
): PaletteActions {
  /**
   * Handles palette copy in the specified format with user feedback.
   * Copies the content to clipboard and shows success notification.
   */
  const handleCopyAs = useCallback(async (palette: StoredPalette, format: CopyFormat) => {
    try {
      const copiedContent = copyPalette(palette, format);

      await Clipboard.copy(copiedContent);

      showToast({
        style: Toast.Style.Success,
        title: "Copied to Clipboard",
        message: `${palette.name} copied as ${getFormatDisplayName(format)}`,
      });
    } catch (error) {
      console.error("Error copying palette:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Copy Failed",
        message: `Failed to copy "${palette.name}". Please try again.`,
      });
    }
  }, []);

  /**
   * Deletes a palette from local storage with user confirmation and comprehensive error handling.
   * Provides detailed feedback and graceful error recovery with specific user messaging.
   */
  const deletePalette = useCallback(
    async (paletteId: string, paletteName: string) => {
      try {
        // Request user confirmation before deletion
        const confirmed = await confirmAlert({
          title: "Delete Color Palette",
          message: `Are you sure you want to delete "${paletteName}"? This action cannot be undone.`,
          primaryAction: {
            title: "Delete",
          },
          dismissAction: {
            title: "Cancel",
          },
        });

        if (!confirmed) return;

        // Find the palette to verify it exists
        const paletteToDelete = colorPalettes?.find((p) => p.id === paletteId);
        if (!paletteToDelete) {
          showToast({
            style: Toast.Style.Failure,
            title: "Error",
            message: "Palette not found or already deleted",
          });
          return;
        }

        // Perform deletion
        const updatedPalettes = colorPalettes ? colorPalettes.filter((palette) => palette.id !== paletteId) : [];
        await setColorPalettes(updatedPalettes);

        showToast({
          style: Toast.Style.Success,
          title: "Deleted",
          message: `"${paletteName}" has been deleted successfully`,
        });
      } catch (error) {
        console.error("Error deleting palette:", error);
        showToast({
          style: Toast.Style.Failure,
          title: "Deletion Failed",
          message: `Failed to delete "${paletteName}". Please try again.`,
        });
      }
    },
    [colorPalettes, setColorPalettes],
  );

  /**
   * Creates type-safe form data for editing an existing palette.
   * Includes editingPaletteId to enable overwrite functionality in the form component.
   */
  const createEditFormData = useCallback((palette: StoredPalette): PaletteFormData => {
    const formData: Partial<PaletteFormData> = {
      name: palette.name,
      description: palette.description,
      mode: palette.mode,
      keywords: palette.keywords || [],
      editingPaletteId: palette.id, // This tells the form to overwrite instead of create new
    };

    // Add color fields with proper typing
    palette.colors.forEach((color, index) => {
      const colorKey = `color${index + 1}` as const;
      (formData as any)[colorKey] = color;
    });

    return formData as PaletteFormData;
  }, []);

  /**
   * Creates a duplicate of an existing palette with a new ID and modified name.
   * The user stays in the view palettes command and sees the new duplicate appear.
   */
  const duplicatePalette = useCallback(
    async (palette: StoredPalette) => {
      try {
        // Create a new palette with a unique ID and modified name
        const duplicatedPalette: StoredPalette = {
          ...palette,
          id: Date.now().toString(), // Generate new unique ID
          name: `${palette.name} Copy`, // Add "Copy" suffix to distinguish
          createdAt: new Date().toISOString(), // Set new creation date
        };

        // Add the duplicated palette to the list
        const updatedPalettes = colorPalettes ? [...colorPalettes, duplicatedPalette] : [duplicatedPalette];
        await setColorPalettes(updatedPalettes);

        showToast({
          style: Toast.Style.Success,
          title: "Palette Duplicated",
          message: `"${duplicatedPalette.name}" has been created successfully`,
        });
      } catch (error) {
        console.error("Error duplicating palette:", error);
        showToast({
          style: Toast.Style.Failure,
          title: "Duplication Failed",
          message: `Failed to duplicate "${palette.name}". Please try again.`,
        });
      }
    },
    [colorPalettes, setColorPalettes],
  );

  return {
    handleCopyAs,
    deletePalette,
    createEditFormData,
    duplicatePalette,
  };
}
