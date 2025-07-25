import { useState } from "react";
import { ColorItem, UseSelectionReturn } from "../types";

/**
 * Custom hook for managing multi-item selection state in color picker components.
 *
 * Provides a complete selection interface with actions, state tracking, and utility functions.
 * Uses ID-based selection to avoid object reference equality issues and ensure reliable
 * selection state management across component re-renders.
 *
 * @param items - Array of ColorItem objects that can be selected
 * @returns Object containing selection actions, current state, and helper functions
 *
 * @example
 * ```tsx
 * const colorItems = [
 *   { id: "1", color: "#FF0000" },
 *   { id: "2", color: "#00FF00" }
 * ];
 *
 * const selection = useSelection(colorItems);
 *
 * // Toggle individual item selection
 * selection.actions.toggleSelection(colorItems[0]);
 *
 * // Check selection state
 * const isSelected = selection.helpers.getIsItemSelected(colorItems[0]);
 * const count = selection.selected.countSelected;
 * ```
 */
export function useSelection(items: ColorItem[] | undefined): UseSelectionReturn {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const toggleSelection = (item: ColorItem) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (items) {
      setSelectedItemIds(new Set(items.map((item) => item.id)));
    }
  };

  const clearSelection = () => {
    setSelectedItemIds(new Set());
  };

  const getIsItemSelected = (item: ColorItem) => selectedItemIds.has(item.id);
  const anySelected = selectedItemIds.size > 0;
  const allSelected = items ? selectedItemIds.size === items.length : false;
  const countSelected = selectedItemIds.size;

  // Convert back to ColorItem Set for compatibility
  const selectedItems = new Set(items?.filter((item) => selectedItemIds.has(item.id)) || []);

  return {
    actions: {
      toggleSelection,
      selectAll,
      clearSelection,
    },
    selected: {
      selectedItems,
      anySelected,
      allSelected,
      countSelected,
    },
    helpers: {
      getIsItemSelected,
    },
  };
}
