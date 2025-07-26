/**
 * KeywordsSection Component
 *
 * Interactive keyword management with tag picker and text input for creation/selection.
 * Provides dual interface for keyword workflow management.
 */

import { Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { KeywordUpdateResult } from "../types";

/**
 * Props interface for the KeywordsSection component.
 */
type KeywordsSectionProps = {
  /** Array of available keywords from global storage */
  keywords: string[] | undefined;
  /** Form item properties from Raycast's useForm hook */
  itemProps: any;
  /** Function to update the global keywords list and form state */
  updateKeywords: (keywordsText: string) => Promise<KeywordUpdateResult>;
  /** Function to create focus handlers for real-time tracking */
  createFocusHandlers?: (fieldName: string) => { onFocus: () => void; onBlur: () => void };
};

/**
 * Renders keyword management with tag picker and text input.
 * Supports selection from existing keywords and creation of new ones.
 *
 * @param props - Component properties
 */
export function KeywordsSection({ keywords, itemProps, updateKeywords, createFocusHandlers }: KeywordsSectionProps) {
  /** Local state for the keyword input field value */
  const [updateKeywordsValue, setUpdateKeywordsValue] = useState("");

  /**
   * Combined handler for keyword updates with smart toast feedback.
   * Shows different toast messages based on the actual results of the operation.
   */
  const handleKeywordUpdateAndBlur = async () => {
    if (updateKeywordsValue.trim()) {
      const result = await updateKeywords(updateKeywordsValue);

      // Determine toast type and message based on results
      const { validKeywords, invalidKeywords, removedKeywords, duplicateKeywords, totalProcessed } = result;

      const totalSuccessful = validKeywords.length + removedKeywords.length;
      const hasInvalid = invalidKeywords.length > 0;
      const hasDuplicates = duplicateKeywords.length > 0;

      if (totalSuccessful === 0 && totalProcessed > 0) {
        // All keywords were invalid or duplicates
        if (hasInvalid && hasDuplicates) {
          showToast({
            style: Toast.Style.Failure,
            title: "No keywords updated",
            message: `${invalidKeywords.length} invalid, ${duplicateKeywords.length} duplicate keywords`,
          });
        } else if (hasInvalid) {
          showToast({
            style: Toast.Style.Failure,
            title: "Invalid keywords",
            message: `${invalidKeywords.join(", ")} - must be 2-20 chars, alphanumeric + hyphens only`,
          });
        } else if (hasDuplicates) {
          showToast({
            style: Toast.Style.Success,
            title: "No new keywords",
            message: `${duplicateKeywords.join(", ")} already exist`,
          });
        }
      } else if (totalSuccessful > 0 && (hasInvalid || hasDuplicates)) {
        // Partial success
        showToast({
          style: Toast.Style.Success,
          title: `${totalSuccessful} keywords updated`,
          message: hasInvalid
            ? `${invalidKeywords.length} invalid keywords skipped`
            : `${duplicateKeywords.length} duplicates skipped`,
        });
      } else if (totalSuccessful > 0) {
        // Complete success
        const addedCount = validKeywords.length;
        const removedCount = removedKeywords.length;

        if (addedCount > 0 && removedCount > 0) {
          showToast({
            style: Toast.Style.Success,
            title: "Keywords updated",
            message: `${addedCount} added, ${removedCount} removed`,
          });
        } else if (addedCount > 0) {
          showToast({
            style: Toast.Style.Success,
            title: "Keywords added",
            message: `${validKeywords.join(", ")}`,
          });
        } else if (removedCount > 0) {
          showToast({
            style: Toast.Style.Success,
            title: "Keywords removed",
            message: `${removedKeywords.join(", ")}`,
          });
        }
      }

      setUpdateKeywordsValue("");
    }
  };

  // Get focus handlers for both form fields
  const keywordsFocusHandlers = createFocusHandlers ? createFocusHandlers("keywords") : {};
  const updateKeywordsFocusHandlers = createFocusHandlers ? createFocusHandlers("updateKeywords") : {};

  // Combine the keyword update logic with focus tracking for the blur handler
  const handleCombinedBlur = async () => {
    // First handle the focus tracking
    if (updateKeywordsFocusHandlers && "onBlur" in updateKeywordsFocusHandlers) {
      (updateKeywordsFocusHandlers as any).onBlur();
    }
    // Then handle the keyword update logic
    await handleKeywordUpdateAndBlur();
  };

  return (
    <>
      {/* Tag picker for selecting from existing keywords */}
      <Form.TagPicker
        {...itemProps.keywords}
        title="Keywords"
        info="Pick one or more Keywords. Keywords will be used to search and filter Color Palettes. If the Keywords list is empty, add them through the Update Keywords field. To remove a keyword from the Keywords list, enter !keyword-to-remove in the Update Keywords field."
        {...keywordsFocusHandlers}
      >
        {keywords && keywords.map((keyword, idx) => <Form.TagPicker.Item key={idx} value={keyword} title={keyword} />)}
      </Form.TagPicker>

      {/* Text input for adding new keywords or removing existing ones */}
      <Form.TextField
        id="updateKeywords"
        title="Update Keywords"
        value={updateKeywordsValue}
        onChange={setUpdateKeywordsValue}
        placeholder="e.g., keyword1, keyword2, !keyword-to-remove"
        info="Enter Keywords separated by commas. Press Tab or move out of focus in order to add them to the Keywords List in the Keywords field above."
        onFocus={"onFocus" in updateKeywordsFocusHandlers ? (updateKeywordsFocusHandlers as any).onFocus : undefined}
        onBlur={handleCombinedBlur}
      />
    </>
  );
}
