/**
 * Custom React hook for managing persistent keyword storage and manipulation.
 *
 * This hook provides comprehensive keyword management for color palette tagging and organization.
 * It leverages Raycast's local storage utilities to maintain a global keyword list that persists
 * across sessions and can be shared between different palettes.
 *
 * **Key Features:**
 * - Persistent storage of global keyword list
 * - Smart keyword parsing from comma-separated input
 * - Removal syntax using "!" prefix (e.g., "!red" removes "red")
 * - Duplicate prevention for keyword uniqueness
 * - Integration with form draft restoration
 * - Returns newly added keywords for form state synchronization
 *
 * **Keyword Management Rules:**
 * - Keywords are stored globally and shared across all palettes
 * - Comma-separated input automatically parsed and trimmed
 * - Keywords prefixed with "!" are removed from the global list
 * - Duplicate keywords are automatically prevented
 * - Empty or whitespace-only keywords are filtered out
 *
 * @param draftValues - Optional form draft values containing keywords for initialization
 *
 * @returns An object containing:
 * - `keywords`: Current array of all available keywords from storage
 * - `setKeywords`: Direct function to set the entire keywords array
 * - `updateKeywords`: Smart parsing function to add/remove keywords from text input
 *
 * @example
 * ```typescript
 * // Basic usage for keyword management
 * const { keywords, updateKeywords } = useKeywords();
 *
 * // Add new keywords
 * const newKeywords = await updateKeywords("blue,ocean,nature");
 * // Returns: ["blue", "ocean", "nature"] (if they were new)
 *
 * // Remove existing keywords
 * await updateKeywords("!blue,green");
 * // Removes "blue", adds "green" if not present
 *
 * // With draft restoration
 * const { keywords, updateKeywords } = useKeywords(savedDraftValues);
 * ```
 */
import { useLocalStorage } from "@raycast/utils";
import { PaletteFormFields } from "../types";

export function useKeywords(draftValues?: PaletteFormFields) {
  // Global keyword storage shared across all palettes
  const { value: keywords, setValue: setKeywords } = useLocalStorage<string[]>(
    "color-palettes-keywords",
    draftValues?.keywords || [],
  );

  /**
   * Processes keyword input string and updates the global keyword list.
   *
   * Parses comma-separated keyword input with support for removal syntax.
   * Maintains keyword uniqueness and provides clean text processing.
   *
   * @param keywordsText - Comma-separated string of keywords to process
   * @returns Array of newly added keywords (excludes removed ones)
   */
  const updateKeywords = async (keywordsText: string) => {
    // Parse and clean input keywords
    const inputKeywords = keywordsText
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    let newKeywords = [...(keywords ?? [])];
    // Filter out removal keywords for return value
    const updatedKeywords = inputKeywords.filter((keyword) => !keyword.startsWith("!"));

    // Process each keyword: add new ones or remove marked ones
    inputKeywords.forEach((keyword) => {
      if (keyword.startsWith("!")) {
        // Remove keyword - extract the keyword name without the '!' prefix
        const tagToRemove = keyword.slice(1);
        newKeywords = newKeywords.filter((existingTag) => existingTag !== tagToRemove);
      } else {
        // Add keyword if it doesn't already exist (prevent duplicates)
        if (!newKeywords.includes(keyword)) {
          newKeywords.push(keyword);
        }
      }
    });

    // Persist updated keywords to storage
    await setKeywords(newKeywords);

    // Return only the newly added keywords for form state synchronization
    return updatedKeywords;
  };

  return {
    keywords,
    setKeywords,
    updateKeywords,
  };
}
