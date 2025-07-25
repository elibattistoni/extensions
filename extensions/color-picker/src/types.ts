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
 * Result object returned by keyword update operations.
 *
 * Provides detailed feedback about what happened during keyword processing,
 * including successful additions, validation failures, duplicates, and removals.
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

/**
 * Props interface for the KeywordsSection component.
 */
export type KeywordsSectionProps = {
  /** Array of available keywords from global storage */
  keywords: string[] | undefined;
  /** Form item properties from Raycast's useForm hook */
  itemProps: any;
  /** Function to update the global keywords list and form state */
  updateKeywords: (keywordsText: string) => Promise<KeywordUpdateResult>;
  /** Function to create focus handlers for real-time tracking */
  createFocusHandlers?: (fieldName: string) => { onFocus: () => void; onBlur: () => void };
};
