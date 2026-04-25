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
  List,
  showToast,
} from "@raycast/api";
import { showFailureToast, usePromise } from "@raycast/utils";
import { useState } from "react";
import CopyAsSubmenu from "./components/CopyAsSubmenu";
import { EditTitle } from "./components/EditTitle";
import { MultipleColorsActions } from "./components/MultipleColorsActions";
import { ToggleViewAction } from "./components/ToggleViewAction";
import { useColorsSelection } from "./hooks/useColorsSelection";
import { useHistory } from "./lib/history";
import { HistoryItem, UseColorsSelectionObject, ViewMode } from "./lib/types";
import { getFormattedColor, getIcon, getPreviewColor } from "./lib/utils";

const preferences: Preferences.OrganizeColors = getPreferenceValues();

const EMPTY_VIEW_TITLE = "No colors picked yet ¯\\_(ツ)_/¯";
const EMPTY_VIEW_DESCRIPTION = "Use the Pick Color command to pick some";

const PickColorAction = () => (
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
);

export default function Command() {
  const { history } = useHistory();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { selection } = useColorsSelection<HistoryItem>(history ?? [], (item) => getFormattedColor(item.color));

  if (viewMode === "list") {
    return (
      <List>
        <List.EmptyView
          icon={Icon.EyeDropper}
          title={EMPTY_VIEW_TITLE}
          description={EMPTY_VIEW_DESCRIPTION}
          actions={
            <ActionPanel>
              <PickColorAction />
              <ToggleViewAction viewMode={viewMode} setViewMode={setViewMode} />
            </ActionPanel>
          }
        />
        {history?.map((historyItem) => {
          const formattedColor = getFormattedColor(historyItem.color);
          const previewColor = getPreviewColor(historyItem.color);
          const isSelected = selection.helpers.getIsItemSelected(historyItem);

          return (
            <List.Item
              key={historyItem.date}
              icon={getIcon(previewColor)}
              title={`${isSelected ? "✓ " : ""}${formattedColor}${historyItem.title ? ` ${historyItem.title}` : ""}`}
              subtitle={new Date(historyItem.date).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              actions={
                <Actions
                  historyItem={historyItem}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  selection={selection}
                />
              }
            />
          );
        })}
      </List>
    );
  }

  return (
    <Grid>
      <Grid.EmptyView
        icon={Icon.EyeDropper}
        title={EMPTY_VIEW_TITLE}
        description={EMPTY_VIEW_DESCRIPTION}
        actions={
          <ActionPanel>
            <PickColorAction />
            <ToggleViewAction viewMode={viewMode} setViewMode={setViewMode} />
          </ActionPanel>
        }
      />
      {history?.map((historyItem) => {
        const formattedColor = getFormattedColor(historyItem.color);
        const previewColor = getPreviewColor(historyItem.color);
        const color = { light: previewColor, dark: previewColor, adjustContrast: false };
        const isSelected = selection.helpers.getIsItemSelected(historyItem);

        return (
          <Grid.Item
            key={historyItem.date}
            content={historyItem.title ? { value: { color }, tooltip: historyItem.title } : { color }}
            title={`${isSelected ? "✓ " : ""}${formattedColor}${historyItem.title ? ` ${historyItem.title}` : ""}`}
            subtitle={new Date(historyItem.date).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            actions={
              <Actions historyItem={historyItem} viewMode={viewMode} setViewMode={setViewMode} selection={selection} />
            }
          />
        );
      })}
    </Grid>
  );
}

type ActionsProps = {
  historyItem: HistoryItem;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selection: UseColorsSelectionObject<HistoryItem>;
};

function Actions({ historyItem, viewMode, setViewMode, selection }: ActionsProps) {
  const { remove, clear, edit } = useHistory();
  const { data: frontmostApp } = usePromise(async () => {
    try {
      return await getFrontmostApplication();
    } catch {
      return null;
    }
  }, []);

  const color = historyItem.color;
  const formattedColor = getFormattedColor(color);

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

      <MultipleColorsActions selection={selection} focusedItem={historyItem} formattedFocusedItem={formattedColor} />

      <ActionPanel.Section title="View">
        <ToggleViewAction viewMode={viewMode} setViewMode={setViewMode} />
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
