import { Clipboard, confirmAlert, Icon, List, showToast, Toast } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { useCallback, useMemo, useState } from "react";
import { ViewPalettesActions } from "./components/ViewPalettesActions";
import { PaletteFormData, StoredPalette } from "./types";
import { CopyFormat, copyPalette, getFormatDisplayName } from "./utils/copyPalette";

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
 * Provides search, filtering, CRUD operations, and copy functionality with keyboard shortcuts.
 *
 * **Features:**
 * - Type-safe palette management with comprehensive TypeScript definitions
 * - Performance-optimized search with memoized filtering across name, description, and keywords
 * - Enhanced user experience with confirmation dialogs and detailed feedback
 * - Comprehensive error handling for all operations with graceful recovery
 * - Memory-efficient rendering with optimized callbacks and memoization
 * - Multi-format copy capabilities (JSON, CSS, CSS Variables, Plain Text)
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
   * Handles palette copy in the specified format with user feedback.
   * Copies the content to clipboard and shows success notification.
   */
  const handleCopyAs = useCallback(async (palette: StoredPalette, format: CopyFormat) => {
    try {
      const copiedContent = copyPalette(palette, format);

      await Clipboard.copy(copiedContent);

      showToast({
        style: Toast.Style.Success,
        title: "Copied to Clipboard",
        message: `${palette.name} copied as ${getFormatDisplayName(format)}`,
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
              <ViewPalettesActions
                palette={palette}
                handleCopyAs={handleCopyAs}
                deletePalette={deletePalette}
                createEditFormData={createEditFormData}
                createDuplicateFormData={createDuplicateFormData}
              />
            }
          />
        ))
      )}
    </List>
  );
}
