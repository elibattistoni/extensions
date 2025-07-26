import { Icon, List } from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import { useMemo, useState } from "react";
import { ViewPalettesActions } from "./components/ViewPalettesActions";
import { usePaletteActions } from "./hooks/usePaletteActions";
import { StoredPalette } from "./types";

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

  // === Palette Actions Hook ===
  /** Custom hook providing all palette management actions */
  const paletteActions = usePaletteActions(colorPalettes, setColorPalettes);

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
            actions={<ViewPalettesActions palette={palette} actions={paletteActions} />}
          />
        ))
      )}
    </List>
  );
}
