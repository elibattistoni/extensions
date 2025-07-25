/**
 * ColorFieldsSection Component
 *
 * Renders dynamic color input fields with intelligent focus management and validation.
 * Uses a count-based approach for cleaner state management.
 */

import { Form } from "@raycast/api";
import { useEffect, useRef } from "react";
import { PaletteFormFields } from "../types";

/**
 * Props interface for the ColorFieldsSection component.
 */
interface ColorFieldsSectionProps {
  /** Number of color fields to render */
  colorFieldCount: number;
  /** Form item properties from Raycast's useForm hook */
  itemProps: any;
  /** Field that should receive autoFocus for draft restoration */
  autoFocusField: string | null;
  /** Currently focused field for programmatic focus */
  currentFocusedField: string | null;
  /** Function to create focus handlers for real-time tracking */
  createFocusHandlers: (fieldName: string) => { onFocus: () => void; onBlur: () => void };
}

/**
 * Renders dynamic color input fields with focus management and validation.
 *
 * @param props - Component properties
 */
export function ColorFieldsSection({
  colorFieldCount,
  itemProps,
  autoFocusField,
  currentFocusedField,
  createFocusHandlers,
}: ColorFieldsSectionProps) {
  // Refs to store references to each color field input
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Effect to handle programmatic focus changes
  useEffect(() => {
    if (currentFocusedField && currentFocusedField.startsWith("color")) {
      const fieldElement = fieldRefs.current[currentFocusedField];
      if (fieldElement) {
        fieldElement.focus();
      }
    }
  }, [currentFocusedField]);
  return (
    <>
      {/* Visual separator to distinguish color fields section */}
      <Form.Separator />

      {/* Render dynamic color input fields */}
      {Array.from({ length: colorFieldCount }, (_, index) => {
        const colorKey = `color${index + 1}` as keyof PaletteFormFields;
        const shouldFocus = autoFocusField === colorKey;
        const isRequired = index === 0; // First color field is required
        const focusHandlers = createFocusHandlers(colorKey);

        return (
          <Form.TextField
            key={index}
            {...(itemProps[colorKey] as any)}
            ref={(el: HTMLInputElement) => {
              fieldRefs.current[colorKey] = el;
            }}
            title={`${index + 1}. Color${isRequired ? "*" : ""}`}
            placeholder="e.g., #FF5733, rgb(255, 87, 51), or rgba(255, 87, 51, 0.8)"
            autoFocus={shouldFocus}
            onFocus={focusHandlers.onFocus}
            onBlur={focusHandlers.onBlur}
          />
        );
      })}
    </>
  );
}
