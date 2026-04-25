import { useEffect, useState } from "react";
import { HistoryItem, UseColorsSelectionObject } from "../lib/types";

type UseSelectionReturn<T> = {
  selection: UseColorsSelectionObject<T>;
};

export function useColorsSelection<T = string | HistoryItem>(
  items: T[],
  getKey?: (item: T) => string,
): UseSelectionReturn<T> {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const computeKey = (i: T): string => (getKey ? getKey(i) : (i as unknown as string));

  // Keep selection in sync with items: drop any selected key whose item is no
  // longer present (e.g. deleted from history, "Delete All", or removed by a
  // background command). Without this, stale entries would inflate counts and
  // could resurface as ghost selections if an item with the same key returned.
  useEffect(() => {
    setSelectedKeys((prev) => {
      if (prev.size === 0) return prev;
      const validKeys = new Set(items.map(computeKey));
      const next = new Set<string>();
      for (const k of prev) if (validKeys.has(k)) next.add(k);
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  const toggleSelection = (item: T) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const itemKey = computeKey(item);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const selectAll = () => setSelectedKeys(new Set(items.map(computeKey)));
  const clearSelection = () => setSelectedKeys(new Set());

  const getIsItemSelected = (item: T) => selectedKeys.has(computeKey(item));

  // Derive selected items from the live items array so callers never see ghosts.
  const selectedItems = items.filter((i) => selectedKeys.has(computeKey(i)));

  return {
    selection: {
      actions: { toggleSelection, selectAll, clearSelection },
      selected: {
        selectedItems,
        anySelected: selectedItems.length > 0,
        allSelected: items.length > 0 && items.length === selectedItems.length,
        countSelected: selectedItems.length,
      },
      helpers: { getIsItemSelected },
    },
  };
}
