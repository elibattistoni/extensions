/**
 * KeywordsSection Component
 *
 * Interactive keyword management with tag picker and text input for creation/selection.
 * Provides dual interface for keyword workflow management.
 */

import { Form, showToast, Toast } from "@raycast/api";
import { useState } from "react";

/**
 * Props interface for the KeywordsSection component.
 */
interface KeywordsSectionProps {
  /** Array of available keywords from global storage */
  keywords: string[] | undefined;
  /** Form item properties from Raycast's useForm hook */
  itemProps: any;
  /** Function to update the global keywords list and form state */
  updateKeywords: (keywordsText: string) => Promise<void>;
  /** Function to create focus handlers for real-time tracking */
  createFocusHandlers?: (fieldName: string) => { onFocus: () => void; onBlur: () => void };
}

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
   * Combined handler for keyword updates and focus tracking.
   */
  const handleKeywordUpdateAndBlur = async () => {
    if (updateKeywordsValue.trim()) {
      await updateKeywords(updateKeywordsValue);
      showToast({
        style: Toast.Style.Success,
        title: "Keywords list successfully updated!",
        message: "",
      });
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
