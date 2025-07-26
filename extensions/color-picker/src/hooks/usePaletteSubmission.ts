import { launchCommand, LaunchType, popToRoot, showToast, Toast } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { PaletteFormFields, StoredPalette } from "../types";
import { extractColorValues } from "../utils/formHelpers";

/**
 * Hook for color palette submission and persistence operations.
 *
 * Encapsulates complex palette save operations including local storage management,
 * data transformation, user feedback, and navigation. Handles both creation and editing
 * with context-aware navigation to prevent command launch loops.
 *
 * **Key Features:**
 * - Creates new palettes or updates existing ones based on editingPaletteId
 * - Extracts color values from form data and generates storage format
 * - Provides user feedback via toast notifications with specific success/error messages
 * - Manages navigation: returns to main interface for edits, navigates to palette list for new items
 * - Prevents navigation loops in nested contexts (Action.Push scenarios)
 *
 * @returns Object with `submitPalette` function for handling form submission
 *
 * @example
 * ```typescript
 * const { submitPalette } = usePaletteSubmission();
 *
 * await submitPalette({
 *   formValues: { name: "Ocean", colors: ["#2E86AB"] },
 *   colorCount: 1,
 *   onSubmit: () => form.reset(),
 *   isNestedContext: false
 * });
 * ```
 */
export function usePaletteSubmission() {
  // Access local storage for palette persistence using Raycast's utilities
  // The storage key "color-palettes-list" is shared across the extension
  const { value: storedPalettes, setValue: setStoredPalettes } = useLocalStorage<StoredPalette[]>(
    "color-palettes-list",
    [],
  );

  /**
   * Saves a color palette to local storage with comprehensive error handling.
   *
   * Orchestrates the entire submission process: data transformation, persistence,
   * user feedback, and context-aware navigation. Handles both palette creation
   * and editing operations seamlessly.
   *
   * @param params - Submission parameters
   * @param params.formValues - Validated form data containing palette information
   * @param params.colorCount - Number of color fields to extract from form data
   * @param params.onSubmit - Callback executed after successful save for form cleanup
   * @param params.isNestedContext - Whether form is in nested context to prevent navigation loops
   *
   * @example
   * ```typescript
   * await submitPalette({
   *   formValues: { name: "Sunset", mode: "light", description: "Beach vibes" },
   *   colorCount: 3,
   *   onSubmit: () => form.reset()
   * });
   * ```
   */
  const submitPalette = async ({
    formValues,
    colorCount,
    onSubmit,
    isNestedContext = false,
  }: {
    formValues: PaletteFormFields;
    colorCount: number;
    onSubmit: () => void;
    isNestedContext?: boolean;
  }) => {
    try {
      // Extract color values from form data (eliminates the need for duplicate parameters)
      const colorValues = extractColorValues(formValues, colorCount);

      // Check if we're editing an existing palette
      if (formValues.editingPaletteId) {
        // UPDATE EXISTING PALETTE
        // First, verify the palette exists
        const existingPalette = (storedPalettes ?? []).find((p) => p.id === formValues.editingPaletteId);
        if (!existingPalette) {
          showToast({
            style: Toast.Style.Failure,
            title: "Error",
            message: "Palette not found. It may have been deleted.",
          });
          return;
        }

        const updatedPalettes = (storedPalettes ?? []).map((palette) => {
          if (palette.id === formValues.editingPaletteId) {
            return {
              ...palette,
              name: formValues.name,
              description: formValues.description,
              mode: formValues.mode as "light" | "dark",
              keywords: formValues.keywords || [],
              colors: colorValues,
              // Keep original ID and createdAt
            };
          }
          return palette;
        });

        await setStoredPalettes(updatedPalettes);

        // Provide specific success feedback for edits
        showToast({
          style: Toast.Style.Success,
          title: "Updated!",
          message: `${formValues.name} palette updated with ${colorValues.length} color${colorValues.length > 1 ? "s" : ""}`,
        });

        // For editing: Return to main Raycast interface
        await popToRoot();
        return;
      } else {
        // CREATE NEW PALETTE
        const palette: StoredPalette = {
          id: Date.now().toString(), // Simple timestamp-based ID (sufficient for personal use)
          name: formValues.name,
          description: formValues.description,
          mode: formValues.mode as "light" | "dark", // Type assertion for validated enum value
          keywords: formValues.keywords || [], // Default to empty array if no keywords provided
          colors: colorValues, // Pre-validated hex color array
          createdAt: new Date().toISOString(), // ISO timestamp for consistent date handling
        };

        // Prepend new palette to maintain chronological order (newest first)
        const updatedPalettes = [palette, ...(storedPalettes ?? [])];
        await setStoredPalettes(updatedPalettes);

        // Provide detailed success feedback to user
        showToast({
          style: Toast.Style.Success,
          title: "Success!",
          message: `${formValues.name} ${formValues.mode} color palette created with ${colorValues.length} color${colorValues.length > 1 ? "s" : ""}`,
        });
      }

      // For creating new palettes: Cleanup form first
      onSubmit();

      // Navigate to view-palettes only if not in nested context (to prevent "Command cannot launch itself" error)
      if (!isNestedContext) {
        await launchCommand({
          name: "view-color-palettes",
          type: LaunchType.UserInitiated,
        });
      }
    } catch (error) {
      // Log error for debugging while showing user-friendly message
      console.error("Error saving palette:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to save color palette",
      });
      // Note: We don't re-throw the error to prevent form component crashes
      // The error is logged and user is notified, allowing them to retry
    }
  };

  return {
    submitPalette,
  };
}
