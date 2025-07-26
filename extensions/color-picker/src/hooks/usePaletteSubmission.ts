import { launchCommand, LaunchType, popToRoot, showToast, Toast } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { PaletteFormFields, StoredPalette } from "../types";
import { extractColorValues } from "../utils/formHelpers";

/**
 * Custom hook for handling color palette submission and persistence logic.
 *
 * This hook encapsulates all the complex operations required to save a color palette,
 * including local storage management, data transformation, user feedback, and navigation.
 * It provides a clean interface for form components to submit palette data without
 * handling the underlying storage and navigation complexity.
 *
 * **Responsibilities:**
 * - Handles both creating new palettes and editing existing ones
 * - Extracts and validates color values from form data
 * - Transforms form data into persistable storage format
 * - Manages local storage operations for palette persistence
 * - Generates unique IDs and timestamps for new palettes
 * - Updates existing palettes while preserving original metadata
 * - Provides user feedback through toast notifications
 * - Handles context-aware navigation: returns to main Raycast interface for edits, navigates to palette list for new palettes (when not in nested context)
 * - Prevents "Command cannot launch itself" errors by avoiding navigation loops in nested contexts
 * - Manages error handling and recovery for failed submissions
 * - Executes success callbacks for form cleanup operations
 *
 * **Integration Points:**
 * - Uses Raycast's local storage utilities for data persistence
 * - Integrates with Raycast's toast system for user notifications
 * - Handles navigation between extension commands (for new palettes)
 * - Coordinates with form components through callback functions
 *
 * @returns An object containing:
 * - `submitPalette`: Async function to save a palette and handle all side effects
 *
 * @example
 * ```typescript
 * // Creating a new palette
 * const { submitPalette } = usePaletteSubmission();
 *
 * const handleSubmit = async (formValues: PaletteFormFields) => {
 *   await submitPalette({
 *     formValues,
 *     colorCount: 3,
 *     onSubmit: () => form.reset()
 *   });
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Editing an existing palette
 * const handleSubmit = async (formValues: PaletteFormFields) => {
 *   await submitPalette({
 *     formValues: { ...formValues, editingPaletteId: "123" },
 *     colorCount: 3,
 *     onSubmit: () => form.reset()
 *   });
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Example of data transformation:
 * // Input: { name: "Sunset", mode: "light", color1: "#FF5733", color2: "#FFC300" }
 * // Output: StoredPalette {
 * //   id: "1642584000000",
 * //   name: "Sunset",
 * //   mode: "light",
 * //   colors: ["#FF5733", "#FFC300"],
 * //   createdAt: "2025-01-19T10:00:00.000Z"
 * // }
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
   * Submits a color palette by saving it to local storage and handling all side effects.
   *
   * This function orchestrates the entire submission process including data transformation,
   * persistence, user feedback, navigation, and error handling. It ensures data consistency
   * and provides a smooth user experience during palette creation.
   *
   * **Process Flow:**
   * 1. Extract color values from form data based on color count
   * 2. Check if editing existing palette (based on editingPaletteId)
   * 3a. For editing: Update existing palette in storage, show success toast, return to main Raycast interface
   * 3b. For creation: Transform form data into storage format, generate unique ID and timestamp
   * 4. For creation: Prepend new palette to existing list, persist to local storage
   * 5. For creation: Show success notification, execute form cleanup
   * 6. For creation: Navigate to palette list (only if not in nested context to prevent command launch loops)
   * 7. Handle any errors with user-friendly messages
   *
   * @param params - Object containing all submission parameters
   * @param params.formValues - The validated form data containing palette information
   * @param params.colorCount - Number of color fields to extract from form data
   * @param params.onSubmit - Callback function executed after successful save (for form cleanup)
   * @param params.isNestedContext - Whether the form is in a nested context (Action.Push) to prevent navigation loops
   *
   * @throws Will catch and handle any storage or navigation errors internally
   *
   * @example
   * ```typescript
   * await submitPalette({
   *   formValues: { name: "Ocean", mode: "light", description: "Beach vibes" },
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
        const updatedPalettes = (storedPalettes ?? []).map((existingPalette) => {
          if (existingPalette.id === formValues.editingPaletteId) {
            return {
              ...existingPalette,
              name: formValues.name,
              description: formValues.description,
              mode: formValues.mode as "light" | "dark",
              keywords: formValues.keywords || [],
              colors: colorValues,
              // Keep original ID and createdAt
            };
          }
          return existingPalette;
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
