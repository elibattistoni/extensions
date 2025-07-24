import { useState } from "react";
import { HistoryItem, UseSelectionReturn } from "./types";

export function useSelection(items: HistoryItem[] | undefined): UseSelectionReturn {
  const [selectedItems, setSelectedItems] = useState<Set<HistoryItem>>(new Set());

  const toggleSelection = (item: HistoryItem) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (items) {
      setSelectedItems(new Set(items));
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const getIsItemSelected = (item: HistoryItem) => selectedItems.has(item);
  const anySelected = selectedItems.size > 0;
  const allSelected = items ? selectedItems.size === items.length : false;
  const countSelected = selectedItems.size;

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
