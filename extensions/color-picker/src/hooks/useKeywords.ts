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
 *
 * **Smart Toast Feedback System:**
 * The hook returns detailed `KeywordUpdateResult` objects that enable intelligent UI feedback.
 * Different scenarios trigger appropriate toast messages:
 *
 * | Scenario | Toast Type | Example Message |
 * |----------|-----------|-----------------|
 * | All invalid | 🔴 Failure | "Invalid keywords: xyz - must be 2-20 chars, alphanumeric + hyphens only" |
 * | All duplicates | 🟡 Success | "No new keywords: blue, red already exist" |
 * | Mixed invalid/duplicates | 🔴 Failure | "No keywords updated: 2 invalid, 1 duplicate keywords" |
 * | Partial success | 🟡 Success | "2 keywords updated: 1 invalid keywords skipped" |
 * | Complete success (add) | 🟢 Success | "Keywords added: ocean, sunset" |
 * | Complete success (remove) | 🟢 Success | "Keywords removed: old-tag" |
 * | Complete success (mixed) | 🟢 Success | "Keywords updated: 2 added, 1 removed" |
 *
 * **Enhanced Validation Features:**
 * - ✅ Precise feedback with no misleading success messages
 * - ✅ Clear validation error explanations (2-20 chars, alphanumeric + hyphens)
 * - ✅ Informative duplicate and partial success warnings
 * - ✅ Detailed success messages showing exact changes made
 */
import { useLocalStorage } from "@raycast/utils";
import { KeywordUpdateResult, PaletteFormFields } from "../types";
import { filterValidKeywords } from "../utils/keywordValidation";

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
   * Maintains keyword uniqueness and provides detailed feedback about the operation.
   *
   * @param keywordsText - Comma-separated string of keywords to process
   * @returns Object with detailed results of the keyword update operation
   */
  const updateKeywords = async (keywordsText: string): Promise<KeywordUpdateResult> => {
    // Parse and clean input keywords
    const inputKeywords = keywordsText
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    // Separate add and remove keywords
    const addKeywords = inputKeywords.filter((k) => !k.startsWith("!"));
    const removeKeywords = inputKeywords.filter((k) => k.startsWith("!")).map((k) => k.slice(1));

    // Validate add keywords
    const validAddKeywords = filterValidKeywords(addKeywords);
    const invalidAddKeywords = addKeywords.filter((k) => !filterValidKeywords([k]).length);

    let newKeywords = [...(keywords ?? [])];
    const actuallyRemoved: string[] = [];

    // Process removal keywords first
    removeKeywords.forEach((keyword) => {
      const beforeLength = newKeywords.length;
      newKeywords = newKeywords.filter((existingTag) => existingTag !== keyword);
      if (newKeywords.length < beforeLength) {
        actuallyRemoved.push(keyword);
      }
    });

    // Process addition keywords (only valid ones that aren't duplicates)
    const actuallyAdded = validAddKeywords.filter((keyword) => {
      if (!newKeywords.includes(keyword)) {
        newKeywords.push(keyword);
        return true;
      }
      return false;
    });

    // Persist updated keywords to storage
    await setKeywords(newKeywords);

    // Return detailed results
    return {
      validKeywords: actuallyAdded,
      invalidKeywords: invalidAddKeywords,
      removedKeywords: actuallyRemoved,
      duplicateKeywords: validAddKeywords.filter((k) => !actuallyAdded.includes(k)),
      totalProcessed: inputKeywords.length,
    };
  };

  return {
    keywords,
    setKeywords,
    updateKeywords,
  };
}
