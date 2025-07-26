import { Action, ActionPanel, Clipboard, confirmAlert, Icon, LaunchType, List, showToast, Toast } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { useCallback, useMemo, useState } from "react";
import SaveColorPaletteCommand from "./save-color-palette";
import { PaletteFormData, StoredPalette } from "./types";
import { ExportFormat, exportPalette, getFileExtension, getFormatDisplayName } from "./utils/exportPalette";

/**
 * Creates markdown overview for palette preview in list view.
 * Displays essential palette information in a structured format.
 */
const createMdOverview = (palette: StoredPalette) => {
  return `
# ${palette.name}

**Description:** ${palette.description || "No description provided"}

**Created:** ${new Date(palette.createdAt).toLocaleDateString()}

**Colors:** ${palette.colors.length} color${palette.colors.length !== 1 ? "s" : ""}
`;
};

/**
 * Color Palette Viewer Command
 *
 * Main interface for viewing, managing, and organizing saved color palettes.
 * Provides search, filtering, CRUD operations, and export functionality with keyboard shortcuts.
 *
 * **Features:**
 * - Type-safe palette management with comprehensive TypeScript definitions
 * - Performance-optimized search with memoized filtering across name, description, and keywords
 * - Enhanced user experience with confirmation dialogs and detailed feedback
 * - Comprehensive error handling for all operations with graceful recovery
 * - Memory-efficient rendering with optimized callbacks and memoization
 * - Multi-format export capabilities (JSON, CSS, CSS Variables, Plain Text)
 *
 * **Architecture:**
 * - Uses React hooks for state management and performance optimization
 * - Implements proper TypeScript types for form data creation and validation
 * - Leverages Raycast's native components for consistent UX and platform integration
 */
export default function Command() {
  // === Data Management ===
  /** Local storage hook for palette persistence with loading state management */
  const {
    value: colorPalettes,
    setValue: setColorPalettes,
    isLoading,
  } = useLocalStorage<StoredPalette[]>("color-palettes-list", []);

  // === Search State ===
  /** Current search query for filtering palettes */
  const [searchText, setSearchText] = useState("");

  // === Search Effect ===
  /**
   * Filters palettes based on search text across multiple fields.
   * Searches through palette name, description, and keywords for comprehensive matching.
   * Uses memoization for optimal performance with large palette collections.
   */
  const filteredPalettes = useMemo(() => {
    if (!colorPalettes || colorPalettes.length === 0) return [];
    if (!searchText.trim()) return colorPalettes;

    const searchLower = searchText.toLowerCase();
    return colorPalettes.filter((item) => {
      return (
        (item.keywords && item.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))) ||
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    });
  }, [searchText, colorPalettes]);

  /**
   * Deletes a palette from local storage with user confirmation and comprehensive error handling.
   * Provides detailed feedback and graceful error recovery with specific user messaging.
   */
  const deletePalette = useCallback(
    async (paletteId: string, paletteName: string) => {
      try {
        // Request user confirmation before deletion
        const confirmed = await confirmAlert({
          title: "Delete Color Palette",
          message: `Are you sure you want to delete "${paletteName}"? This action cannot be undone.`,
          primaryAction: {
            title: "Delete",
          },
          dismissAction: {
            title: "Cancel",
          },
        });

        if (!confirmed) return;

        // Find the palette to verify it exists
        const paletteToDelete = colorPalettes?.find((p) => p.id === paletteId);
        if (!paletteToDelete) {
          showToast({
            style: Toast.Style.Failure,
            title: "Error",
            message: "Palette not found or already deleted",
          });
          return;
        }

        // Perform deletion
        const updatedPalettes = colorPalettes ? colorPalettes.filter((palette) => palette.id !== paletteId) : [];
        await setColorPalettes(updatedPalettes);

        showToast({
          style: Toast.Style.Success,
          title: "Deleted",
          message: `"${paletteName}" has been deleted successfully`,
        });
      } catch (error) {
        console.error("Error deleting palette:", error);
        showToast({
          style: Toast.Style.Failure,
          title: "Deletion Failed",
          message: `Failed to delete "${paletteName}". Please try again.`,
        });
      }
    },
    [colorPalettes, setColorPalettes],
  );

  /**
   * Creates type-safe form data for editing an existing palette.
   * Includes editingPaletteId to enable overwrite functionality in the form component.
   */
  const createEditFormData = useCallback((palette: StoredPalette): PaletteFormData => {
    const formData: Partial<PaletteFormData> = {
      name: palette.name,
      description: palette.description,
      mode: palette.mode,
      keywords: palette.keywords || [],
      editingPaletteId: palette.id, // This tells the form to overwrite instead of create new
    };

    // Add color fields with proper typing
    palette.colors.forEach((color, index) => {
      const colorKey = `color${index + 1}` as const;
      (formData as any)[colorKey] = color;
    });

    return formData as PaletteFormData;
  }, []);

  /**
   * Creates type-safe form data for duplicating a palette.
   * Generates a copy with "(Copy)" suffix and no editingPaletteId for new palette creation.
   */
  const createDuplicateFormData = useCallback((palette: StoredPalette): PaletteFormData => {
    const formData: Partial<PaletteFormData> = {
      name: `${palette.name} (Copy)`,
      description: palette.description,
      mode: palette.mode,
      keywords: palette.keywords || [],
      // No editingPaletteId = creates new palette
    };

    // Add color fields with proper typing
    palette.colors.forEach((color, index) => {
      const colorKey = `color${index + 1}` as const;
      (formData as any)[colorKey] = color;
    });

    return formData as PaletteFormData;
  }, []);

  /**
   * Handles palette export in the specified format with user feedback.
   * Copies the exported content to clipboard and shows success notification.
   */
  const handleCopyAs = useCallback(async (palette: StoredPalette, format: ExportFormat) => {
    try {
      const exportedContent = exportPalette(palette, format);
      const fileName = `${palette.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.${getFileExtension(format)}`;

      await Clipboard.copy(exportedContent);

      showToast({
        style: Toast.Style.Success,
        title: "Copied to Clipboard",
        message: `${palette.name} copied as ${getFormatDisplayName(format)} (${fileName})`,
      });
    } catch (error) {
      console.error("Error copying palette:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Copy Failed",
        message: `Failed to copy "${palette.name}". Please try again.`,
      });
    }
  }, []);

  return (
    <List
      isLoading={isLoading}
      filtering={false}
      onSearchTextChange={setSearchText}
      navigationTitle="Search Color Palettes"
      searchBarPlaceholder="Search your Color Palette..."
      isShowingDetail={true}
    >
      {filteredPalettes.length === 0 ? (
        <List.EmptyView
          icon={Icon.Ellipsis}
          title="No Color Palettes Found"
          description="Create your first color palette using the save command"
        />
      ) : (
        filteredPalettes.map((palette: StoredPalette) => (
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
                {/* COPY SUBMENU */}
                <ActionPanel.Submenu
                  title="Copy Palette Colors"
                  icon={Icon.Download}
                  shortcut={{ modifiers: ["cmd"], key: "x" }}
                >
                  <Action title="Copy as JSON" onAction={() => handleCopyAs(palette, "json")} icon={Icon.Code} />
                  <Action title="Copy as CSS Classes" onAction={() => handleCopyAs(palette, "css")} icon={Icon.Code} />
                  <Action
                    title="Copy as CSS Variables"
                    onAction={() => handleCopyAs(palette, "css-variables")}
                    icon={Icon.Code}
                  />
                  <Action
                    title="Copy as Plain Text"
                    onAction={() => handleCopyAs(palette, "txt")}
                    icon={Icon.Document}
                  />
                  <Action.CopyToClipboard title="Copy All Colors" content={palette.colors.join(";")} />
                  {palette.colors.map((color, idx) => (
                    <Action.CopyToClipboard key={idx} title={`Copy Color ${idx + 1}`} content={palette.colors[idx]} />
                  ))}
                </ActionPanel.Submenu>

                <Action.OpenInBrowser
                  title="Open in Coolors"
                  url={`https://coolors.co/${palette.colors.map((color) => color.replace("#", "")).join("-")}`}
                  icon={Icon.Globe}
                  shortcut={{ modifiers: ["cmd"], key: "o" }}
                />

                {/* EDIT PALETTE */}
                <Action.Push
                  title="Edit Palette"
                  target={
                    <SaveColorPaletteCommand
                      launchType={LaunchType.UserInitiated}
                      arguments={{}}
                      draftValues={createEditFormData(palette)}
                    />
                  }
                  icon={Icon.Pencil}
                  shortcut={{ modifiers: ["cmd"], key: "e" }}
                />

                {/* DUPLICATE PALETTE */}
                <Action.Push
                  title="Duplicate Palette"
                  target={
                    <SaveColorPaletteCommand
                      launchType={LaunchType.UserInitiated}
                      arguments={{}}
                      draftValues={createDuplicateFormData(palette)}
                    />
                  }
                  icon={Icon.Duplicate}
                  shortcut={{ modifiers: ["cmd"], key: "d" }}
                />

                <Action
                  title="Delete Palette"
                  onAction={() => deletePalette(palette.id, palette.name)}
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
