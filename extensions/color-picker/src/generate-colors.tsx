import { AI, Action, ActionPanel, Grid, LaunchProps, List } from "@raycast/api";
import { showFailureToast, useAI } from "@raycast/utils";
import { useState } from "react";
import CopyAsSubmenu from "./components/CopyAsSubmenu";
import { MultipleColorsActions } from "./components/MultipleColorsActions";
import { ToggleViewAction } from "./components/ToggleViewAction";
import { useColorsSelection } from "./hooks/useColorsSelection";
import { addToHistory } from "./lib/history";
import { UseColorsSelectionObject, ViewMode } from "./lib/types";
import { getFormattedColor, getIcon, getPreviewColor } from "./lib/utils";

export default function GenerateColors(props: LaunchProps<{ arguments: Arguments.GenerateColors }>) {
  const { data, isLoading } = useAI(
    `Generate colors based on a prompt.

Please follow these rules:
- You MUST return an JSON array of HEX colors without any other characters. It should be PARSABLE and MINIFIED.
- Return an empty JSON array if it's not possible to generate colors.

Examples:
- ["#66D3BB","#7EDDC6","#96E7D1","#AEEFDB","#C6F9E6"]
- ["#0000CD","#0000FF","#1E90FF"]
- ["#FF0000","#FF6347","#FF7F50","#FF8C00","#FFA07A","#FFA500","#FFD700","#FFDEAD","#FFE4B5","#FFE4C4"]

Prompt: ${props.arguments.prompt}
JSON colors:`,
    {
      model: AI.Model["OpenAI_GPT-5_mini"],
      stream: false,
    },
  );

  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  let colors: string[] = [];
  try {
    colors = data ? (JSON.parse(data) as string[]) : [];
  } catch (error) {
    showFailureToast(error, { title: "Could not generate colors, please try again." });
  }

  const { selection } = useColorsSelection<string>(colors);

  if (viewMode === "list") {
    return (
      <List isLoading={isLoading}>
        {colors.map((c, index) => {
          const formattedColor = getFormattedColor(c);
          const previewColor = getPreviewColor(c);
          const isSelected = selection.helpers.getIsItemSelected(c);

          return (
            <List.Item
              key={index}
              icon={getIcon(previewColor)}
              title={`${isSelected ? "✓ " : ""}${formattedColor}`}
              actions={
                <Actions
                  color={c}
                  formattedColor={formattedColor}
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
    <Grid columns={5} isLoading={isLoading}>
      {colors.map((c, index) => {
        const formattedColor = getFormattedColor(c);
        const previewColor = getPreviewColor(c);
        const color = { light: previewColor, dark: previewColor, adjustContrast: false };
        const isSelected = selection.helpers.getIsItemSelected(c);

        return (
          <Grid.Item
            key={index}
            content={{ color }}
            title={`${isSelected ? "✓ " : ""}${formattedColor}`}
            actions={
              <Actions
                color={c}
                formattedColor={formattedColor}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selection={selection}
              />
            }
          />
        );
      })}
    </Grid>
  );
}

type ActionsProps = {
  color: string;
  formattedColor: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selection: UseColorsSelectionObject<string>;
};

function Actions({ color, formattedColor, viewMode, setViewMode, selection }: ActionsProps) {
  return (
    <ActionPanel>
      <ActionPanel.Section>
        <Action.CopyToClipboard content={formattedColor} onCopy={() => addToHistory(formattedColor)} />
        <Action.Paste content={formattedColor} onPaste={() => addToHistory(formattedColor)} />
        <CopyAsSubmenu color={formattedColor} onCopy={() => addToHistory(formattedColor)} />
      </ActionPanel.Section>

      <MultipleColorsActions
        selection={selection}
        focusedItem={color}
        formattedFocusedItem={formattedColor}
        onCopyMany={(items) => items.forEach((item) => addToHistory(item))}
      />

      <ActionPanel.Section title="View">
        <ToggleViewAction viewMode={viewMode} setViewMode={setViewMode} />
      </ActionPanel.Section>
    </ActionPanel>
  );
}
