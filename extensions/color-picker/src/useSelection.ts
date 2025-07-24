import { useState } from "react";
import { ColorItem, UseSelectionReturn } from "./types";

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
