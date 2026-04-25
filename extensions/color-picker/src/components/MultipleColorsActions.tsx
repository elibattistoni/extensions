import { Action, ActionPanel, Icon } from "@raycast/api";
import { HistoryItem, UseColorsSelectionObject } from "../lib/types";
import { COPY_FORMATS, copySelectedColors, getColor, getFormattedColor } from "../lib/utils";

type Props<T extends HistoryItem | string> = {
  selection: UseColorsSelectionObject<T>;
  focusedItem: T;
  formattedFocusedItem: string;
  /** Optional callback fired after the plain "Copy to Clipboard" action — useful for history tracking. */
  onCopyMany?: (items: T[]) => void;
};

export function MultipleColorsActions<T extends HistoryItem | string>({
  selection,
  focusedItem,
  formattedFocusedItem,
  onCopyMany,
}: Props<T>) {
  const { toggleSelection, selectAll, clearSelection } = selection.actions;
  const { anySelected, allSelected, selectedItems, countSelected } = selection.selected;
  const isSelected = selection.helpers.getIsItemSelected(focusedItem);

  return (
    <ActionPanel.Section title="Multiple Colors">
      {countSelected > 0 && (
        <ActionPanel.Submenu
          title="Copy Selected Colors"
          icon={Icon.CopyClipboard}
          shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
        >
          <Action.CopyToClipboard
            title="Copy to Clipboard"
            content={selectedItems.map((item) => getFormattedColor(getColor(item))).join(";")}
            onCopy={onCopyMany ? () => onCopyMany(selectedItems) : undefined}
          />
          {COPY_FORMATS.map(({ format, title, icon }) => (
            <Action.CopyToClipboard
              key={format}
              title={title}
              content={copySelectedColors(selectedItems, format)}
              icon={icon}
            />
          ))}
        </ActionPanel.Submenu>
      )}
      <Action
        icon={isSelected ? Icon.Checkmark : Icon.Circle}
        title={isSelected ? `Deselect Color ${formattedFocusedItem}` : `Select Color ${formattedFocusedItem}`}
        shortcut={{ modifiers: ["cmd"], key: "s" }}
        onAction={() => toggleSelection(focusedItem)}
      />
      {!allSelected && (
        <Action
          icon={Icon.Checkmark}
          title="Select All Colors"
          shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
          onAction={selectAll}
        />
      )}
      {anySelected && (
        <Action
          icon={Icon.XMarkCircle}
          title="Clear Selection"
          shortcut={{ modifiers: ["cmd", "shift"], key: "z" }}
          onAction={clearSelection}
        />
      )}
    </ActionPanel.Section>
  );
}
