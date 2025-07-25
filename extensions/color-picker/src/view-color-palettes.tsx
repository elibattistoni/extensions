import { Action, ActionPanel, Detail, Icon, Keyboard, List, showToast, Toast } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { useEffect, useState } from "react";
import { StoredPalette } from "./types";
import { formatDate } from "./utils/formatDate";

//>>> WIP
//>>> TODO ELISA add command that calls the Convert Colors command from color picker
//>> TODO command that uses the name colors from the color picker extension to name the colors

/**
 * Creates a markdown overview for palette preview in list view.
 */
const createMdOverview = (palette: StoredPalette) => {
  return `
# ${palette.name}

**Description:** ${palette.description}
`;
};

/**
 * Creates detailed markdown view with color swatches and metadata.
 */
const createMdDetails = (palette: StoredPalette) => {
  // Create visual color swatches using inline HTML for better presentation
  const colorSwatches = palette.colors
    .map(
      (color) =>
        `<div style="width: 50px; height: 50px; background-color: ${color}; display: inline-block; margin-right: 10px; border-radius: 4px;"></div>`,
    )
    .join("");

  // Create numbered list of color codes for easy copying
  const colorList = palette.colors.map((color, index) => `${index + 1}. \`${color}\``).join("\n");

  return `
# ${palette.name}

**Mode:** ${palette.mode === "dark" ? "Dark Color Palette" : "Light Color Palette"}

**Description:** ${palette.description}

**Keywords:** ${palette.keywords && palette.keywords.length > 0 ? palette.keywords.join(", ") : "No keywords"}

**Created:** ${formatDate(palette.createdAt)}

**Colors (${palette.colors.length}):**

${colorList}
---

### Color Palette
${colorSwatches}
    `;
};

/**
 * Color Palette Viewer Command
 *
 * Main interface for viewing, managing, and organizing saved color palettes.
 * Provides search, filtering, and CRUD operations with keyboard shortcuts.
 */
export default function Command() {
  // === Data Management ===
  /** Local storage hook for palette persistence with loading state management */
  const {
    value: colorPalettes,
    setValue: setColorPalettes,
    isLoading,
  } = useLocalStorage<StoredPalette[]>("color-palettes-list", []);

  // === Search and Filter State ===
  /** Current search query for filtering palettes */
  const [searchText, setSearchText] = useState("");

  /** Filtered list of palettes based on search criteria */
  const [filteredList, setFilteredList] = useState<StoredPalette[]>([]);

  // === Search Effect ===
  /**
   * Filters palettes based on search text across multiple fields.
   * Searches through palette name, description, and keywords for matches.
   */
  useEffect(() => {
    if (colorPalettes && colorPalettes.length > 0) {
      const filtered = colorPalettes.filter((item) => {
        if (!searchText) return true;

        const searchLower = searchText.toLowerCase();
        return (
          (item.keywords && item.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))) ||
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        );
      });
      setFilteredList(filtered);
    } else {
      setFilteredList([]);
    }
  }, [searchText, colorPalettes]);

  useEffect(() => {}, [searchText]);

  /**
   * Deletes a palette from local storage with user feedback.
   */
  const deletePalette = async (paletteId: string) => {
    try {
      const updatedPalettes = colorPalettes ? colorPalettes.filter((palette) => palette.id !== paletteId) : [];
      await setColorPalettes(updatedPalettes);

      showToast({
        style: Toast.Style.Success,
        title: "Deleted",
        message: "Color palette deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting palette:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to delete color palette",
      });
    }
  };

  /**
   * Converts stored palette into form data for editing or duplication.
   */
  const createEditableFormData = (palette: StoredPalette, isDuplicate = false) => {
    const formData: any = {
      name: isDuplicate ? `${palette.name} (Copy)` : palette.name,
      description: palette.description,
      mode: palette.mode,
      keywords: palette.keywords || [],
    };

    // Add color fields
    palette.colors.forEach((color, index) => {
      formData[`color${index + 1}`] = color;
    });

    return formData;
  };

  return (
    <List
      isLoading={isLoading}
      filtering={false}
      onSearchTextChange={setSearchText}
      navigationTitle="Search Color Palettes"
      searchBarPlaceholder="Search your Color Palette..."
      isShowingDetail={true}
    >
      {filteredList.length === 0 ? (
        <List.EmptyView
          icon={Icon.Ellipsis}
          title="No Color Palettes Found"
          description="Create your first color palette using the save command"
        />
      ) : (
        filteredList.map((palette) => (
          <List.Item
            key={palette.id}
            icon={{
              source: palette.mode === "dark" ? Icon.Moon : Icon.Sun,
              tintColor: palette.mode === "dark" ? "#000000" : "#ffffff",
            }}
            title={palette.name}
            keywords={palette.keywords || []}
            detail={
              <List.Item.Detail
                markdown={createMdOverview(palette)}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                      icon={palette.mode === "dark" ? Icon.Moon : Icon.Sun}
                      title="Mode"
                      text={palette.mode.charAt(0).toUpperCase() + palette.mode.slice(1) + " Color Palette"}
                    />
                    <List.Item.Detail.Metadata.TagList title="Keywords">
                      {palette.keywords &&
                        palette.keywords.length > 0 &&
                        palette.keywords.map((keyword, idx) => (
                          <List.Item.Detail.Metadata.TagList.Item key={idx} text={keyword} />
                        ))}
                    </List.Item.Detail.Metadata.TagList>
                    <List.Item.Detail.Metadata.Separator />
                    {palette.colors.map((color, idx) => (
                      <List.Item.Detail.Metadata.TagList key={idx} title={`Color ${idx + 1}`}>
                        <List.Item.Detail.Metadata.TagList.Item text={color} color={color} />
                      </List.Item.Detail.Metadata.TagList>
                    ))}
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                {/* 
                //>> TODO ELISA add Action
                // instead of showing the details, open a link to coolors to see the palette
                // you have to convert all the colors to hex format automatically

                TODO add action that converts the colors (using the Color Picker)
                */}
                <Action.Push title="Show Palette Details" target={<Detail markdown={createMdDetails(palette)} />} />
                <Action.CopyToClipboard
                  title="Copy All Colors"
                  content={palette.colors.join(";")}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
                />
                {palette.colors.map((color, idx) => (
                  <Action.CopyToClipboard
                    key={idx}
                    title={`Copy Color ${idx + 1}`}
                    content={palette.colors[idx]}
                    shortcut={{ modifiers: ["cmd", "shift"], key: String(idx + 1) as Keyboard.KeyEquivalent }}
                  />
                ))}
                {/* 
                //>>> TODO ELISA check that the two commands below work as expected
                */}

                {/* NB edit palette actually creates a new copy of an existing palette: fix this */}
                {/* <Action.Push
                  title="Edit Palette (Create Copy)"
                  target={
                    <SaveColorPalettesCommand
                      launchType={LaunchType.UserInitiated}
                      arguments={{}}
                      draftValues={createEditableFormData(palette, true)}
                    />
                  }
                  icon={Icon.Pencil}
                  shortcut={{ modifiers: ["cmd"], key: "e" }}
                />
                <Action.Push
                  title="Duplicate Palette"
                  target={
                    <SaveColorPalettesCommand
                      launchType={LaunchType.UserInitiated}
                      arguments={{}}
                      draftValues={createEditableFormData(palette, true)}
                    />
                  }
                  icon={Icon.Duplicate}
                  shortcut={{ modifiers: ["cmd"], key: "d" }}
                /> */}

                <Action
                  title="Delete Palette"
                  onAction={() => deletePalette(palette.id)}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
