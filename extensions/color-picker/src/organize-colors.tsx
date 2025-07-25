import {
  Action,
  ActionPanel,
  Alert,
  confirmAlert,
  getFrontmostApplication,
  getPreferenceValues,
  Grid,
  Icon,
  Keyboard,
  launchCommand,
  LaunchType,
  showToast,
} from "@raycast/api";
import { showFailureToast, usePromise } from "@raycast/utils";
import CopyAsSubmenu from "./components/CopyAsSubmenu";
import { EditTitle } from "./components/EditTitle";
import { useHistory } from "./history";
import { useSelection } from "./hooks/useSelection";
import { ColorItem, OrganizeColorsActionsProps } from "./types";
import { getFormattedColor, getPreviewColor } from "./utils";

const preferences: Preferences.OrganizeColors = getPreferenceValues();

export default function Command() {
  const { history } = useHistory();

  // Convert HistoryItems to simpler ColorItems for selection
  const colorItems: ColorItem[] | undefined = history?.map((historyItem) => {
    const formattedColor = getFormattedColor(historyItem.color);
    return {
      id: `${historyItem.date}-${formattedColor}`,
      color: formattedColor,
    };
  });

  const selection = useSelection(colorItems);

  return (
    <Grid>
      <Grid.EmptyView
        icon={Icon.EyeDropper}
        title="No colors picked yet ¯\_(ツ)_/¯"
        description="Use the Pick Color command to pick some"
        actions={
          <ActionPanel>
            <Action
              icon={Icon.EyeDropper}
              title="Pick Color"
              onAction={async () => {
                try {
                  await launchCommand({
                    name: "pick-color",
                    type: LaunchType.Background,
                    context: { source: "organize-colors" },
                  });
                } catch (e) {
                  await showFailureToast(e);
                  return e;
                }
              }}
            />
          </ActionPanel>
        }
      />
      {history?.map((historyItem, index) => {
        const colorItem = colorItems?.[index];

        // Use the formatted color from the colorItem to ensure consistency
        const formattedColor = colorItem?.color || getFormattedColor(historyItem.color);
        const previewColor = getPreviewColor(historyItem.color);

        const isSelected = colorItem ? selection.helpers.getIsItemSelected(colorItem) : false;
        const content = isSelected
          ? { source: Icon.CircleFilled, tintColor: { light: previewColor, dark: previewColor, adjustContrast: true } }
          : { color: previewColor };

        return (
          <Grid.Item
            key={formattedColor}
            content={content}
            title={`${isSelected ? "✓ " : ""}${formattedColor} ${historyItem.title ?? ""}`}
            subtitle={new Date(historyItem.date).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            actions={
              <Actions
                {...{
                  historyItem,
                  colorItem,
                  formattedColor,
                  isSelected,
                  selection,
                }}
              />
            }
          />
        );
      })}
    </Grid>
  );
}

/**
 * Action panel component for color history items.
 *
 * Provides comprehensive actions for color management including copy/paste, editing,
 * selection for palette creation, and deletion. Integrates with history management
 * and the selection system for seamless palette workflow.
 *
 * @param historyItem - The original history item containing color and metadata
 * @param colorItem - Simplified color item for selection (may be undefined)
 * @param formattedColor - Pre-computed formatted color string for display/copy
 * @param isSelected - Pre-computed selection state to avoid redundant calculations
 * @param selection - Selection state and actions from useSelection hook
 */
function Actions({ historyItem, colorItem, formattedColor, isSelected, selection }: OrganizeColorsActionsProps) {
  const { remove, clear, edit } = useHistory();
  const { data: frontmostApp } = usePromise(getFrontmostApplication, []);

  const { toggleSelection, selectAll, clearSelection } = selection.actions;
  const { anySelected, allSelected, selectedItems, countSelected } = selection.selected;

  // Use the pre-computed values - no redundant calculations!
  const color = historyItem.color;

  return (
    <ActionPanel>
      <ActionPanel.Section>
        {preferences.primaryAction === "copy" ? (
          <>
            <Action.CopyToClipboard content={formattedColor} />
            <Action.Paste
              title={`Paste to ${frontmostApp?.name || "Active App"}`}
              content={formattedColor}
              icon={frontmostApp ? { fileIcon: frontmostApp.path } : Icon.Clipboard}
            />
          </>
        ) : (
          <>
            <Action.Paste
              title={`Paste to ${frontmostApp?.name || "Active App"}`}
              content={formattedColor}
              icon={frontmostApp ? { fileIcon: frontmostApp.path } : Icon.Clipboard}
            />
            <Action.CopyToClipboard content={formattedColor} />
          </>
        )}
        <CopyAsSubmenu color={color} />
        <Action.Push
          target={<EditTitle item={historyItem} onEdit={edit} />}
          title="Edit Title"
          icon={Icon.Pencil}
          shortcut={Keyboard.Shortcut.Common.Edit}
        />
      </ActionPanel.Section>

      <ActionPanel.Section title="Export Colors to Palettes">
        {countSelected > 0 && (
          <Action
            icon={Icon.AppWindowGrid3x3}
            title={`Export Selected Color${countSelected > 1 ? "s" : ""} (${countSelected})`}
            shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
            onAction={async () => {
              const selectedColorsArray = Array.from(selectedItems);
              try {
                await launchCommand({
                  name: "save-color-palette",
                  type: LaunchType.UserInitiated,
                  context: { selectedColors: selectedColorsArray },
                });
              } catch (e) {
                await showFailureToast(e);
              }
            }}
          />
        )}
        <Action
          icon={isSelected ? Icon.Checkmark : Icon.Circle}
          title={isSelected ? "Deselect Color" : "Select Color"}
          shortcut={{ modifiers: ["cmd"], key: "s" }}
          onAction={() => colorItem && toggleSelection(colorItem)}
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

      <ActionPanel.Section>
        <Action
          icon={Icon.Trash}
          title="Delete Color"
          style={Action.Style.Destructive}
          shortcut={{ modifiers: ["ctrl"], key: "x" }}
          onAction={async () => {
            const confirmed = await confirmAlert({
              title: "Delete Color",
              message: "Do you want to delete the color from your history?",
              rememberUserChoice: true,
              primaryAction: {
                title: "Delete",
                style: Alert.ActionStyle.Destructive,
              },
            });

            if (confirmed) {
              remove(historyItem.color);
              await showToast({ title: "Deleted color" });
            }
          }}
        />
        <Action
          icon={Icon.Trash}
          title="Delete All Colors"
          style={Action.Style.Destructive}
          shortcut={{ modifiers: ["ctrl", "shift"], key: "x" }}
          onAction={async () => {
            const confirmed = await confirmAlert({
              title: "Delete All Colors",
              message: "Do you want to delete all colors from your history?",
              primaryAction: {
                title: "Delete All",
                style: Alert.ActionStyle.Destructive,
              },
            });

            if (confirmed) {
              clear();
              await showToast({ title: "Deleted all colors" });
            }
          }}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
