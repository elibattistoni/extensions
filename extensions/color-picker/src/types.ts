import { launchCommand, LaunchProps } from "@raycast/api";

export type Color = {
  alpha: number;
  red: number; // between 0 and 1
  green: number; // between 0 and 1
  blue: number; // between 0 and 1
  colorSpace: string;
};

export type DeprecatedColor = {
  alpha: number;
  red: number; // between 0 and 255
  green: number; // between 0 and 255
  blue: number; // between 0 and 255
};

// The history color can also be an hex string
export type HistoryColor = Color | DeprecatedColor | string;

export type HistoryItem = {
  date: string;
  color: HistoryColor;
  title?: string;
};

export type ColorItem = {
  id: string;
  color: string;
};

export type LaunchOptions = Parameters<typeof launchCommand>[0];

export type PickColorCommandLaunchProps = LaunchProps<{
  launchContext: {
    source?: "menu-bar" | "organize-colors";
    copyToClipboard?: boolean;
    colorFormat?: string;
    callbackLaunchOptions?: LaunchOptions;
  };
}>;

export type SortType = "platform" | "proximity";

export type ColorFormatType =
  | "hex"
  | "hex-lower-case"
  | "hex-no-prefix"
  | "rgb"
  | "rgb-percentage"
  | "rgba"
  | "rgba-percentage"
  | "hsla"
  | "hsva"
  | "oklch"
  | "lch"
  | "p3";

export type UseSelectionActions = {
  toggleSelection: (item: ColorItem) => void;
  selectAll: () => void;
  clearSelection: () => void;
};

export type UseSelectionState = {
  selectedItems: Set<ColorItem>;
  anySelected: boolean;
  allSelected: boolean;
  countSelected: number;
};

export type UseSelectionHelpers = {
  getIsItemSelected: (item: ColorItem) => boolean;
};

export type UseSelectionReturn = {
  actions: UseSelectionActions;
  selected: UseSelectionState;
  helpers: UseSelectionHelpers;
};

export type OrganizeColorsActionsProps = {
  historyItem: HistoryItem;
  colorItem: ColorItem | undefined;
  formattedColor: string;
  isSelected: boolean;
  selection: UseSelectionReturn;
};

export type GenerateColorsActionsProps = {
  colorItem: ColorItem;
  selection: UseSelectionReturn;
  prompt: string;
};

export type PaletteFormFields = {
  /** Display name for the color palette */
  name: string;
  /** Optional description of the palette's purpose or theme */
  description: string;
  /** Visual mode the palette is designed for */
  mode: string;
  /** Array of tags/keywords for organization and search */
  keywords: string[];
  /** Optional ID of palette being edited (for overwrite functionality) */
  editingPaletteId?: string;
  /** Dynamic color fields with numbered keys (color1, color2, etc.) */
  [key: `color${number}`]: string;
};

export interface PaletteFormProps extends LaunchProps {
  launchContext?: {
    selectedColors?: ColorItem[];
    text?: string;
  };
  draftValues?: PaletteFormFields;
}

export type StoredPalette = {
  /** Unique identifier (timestamp-based for simplicity) */
  id: string;
  /** Display name for the color palette */
  name: string;
  /** Optional description of the palette's purpose or theme */
  description: string;
  /** Visual mode the palette is designed for (strictly typed) */
  mode: "light" | "dark";
  /** Array of tags/keywords for organization and search */
  keywords: string[];
  /** Array of hex color codes in the palette */
  colors: string[];
  /** ISO timestamp of when the palette was created */
  createdAt: string;
};

/**
 * Type-safe form data for palette editing operations.
 * Extends base form fields with proper typing for dynamic color fields.
 */
export type PaletteFormData = PaletteFormFields & {
  /** Dynamic color fields populated from palette colors */
  [K in `color${number}`]: string;
};

/**
 * Result object from keyword update operations with detailed feedback.
 * Provides information about successful additions, validation failures, and duplicates.
 */
export type KeywordUpdateResult = {
  /** Keywords that were successfully added (valid and not duplicates) */
  validKeywords: string[];
  /** Keywords that failed validation */
  invalidKeywords: string[];
  /** Keywords that were successfully removed */
  removedKeywords: string[];
  /** Valid keywords that were already in the list */
  duplicateKeywords: string[];
  /** Total number of keywords processed */
  totalProcessed: number;
};

// === Copy/Export Types ===

/**
 * Copy palette data in various formats for use in different applications and workflows.
 */
export type CopyFormat = "json" | "css" | "txt" | "css-variables";

// === Action Types ===

/**
 * Palette actions interface containing all business logic functions.
 */
export interface PaletteActions {
  handleCopyAs: (palette: StoredPalette, format: CopyFormat) => Promise<void>;
  deletePalette: (paletteId: string, paletteName: string) => Promise<void>;
  createEditFormData: (palette: StoredPalette) => PaletteFormData;
  duplicatePalette: (palette: StoredPalette) => Promise<void>;
}
