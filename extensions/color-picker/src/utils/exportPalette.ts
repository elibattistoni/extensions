import { StoredPalette } from "../types";

/**
 * Export palette data in various formats for use in different applications and workflows.
 */
export type ExportFormat = "json" | "css" | "txt" | "css-variables";

/**
 * Generates JSON export of palette data with complete metadata.
 * Useful for sharing palettes between users or backing up palette data.
 */
export function exportAsJSON(palette: StoredPalette): string {
  const exportData = {
    name: palette.name,
    description: palette.description,
    mode: palette.mode,
    keywords: palette.keywords,
    colors: palette.colors,
    createdAt: palette.createdAt,
    exportedAt: new Date().toISOString(),
    exportFormat: "JSON",
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generates CSS color definitions using class selectors.
 * Perfect for integrating palette colors into web projects.
 */
export function exportAsCSS(palette: StoredPalette): string {
  const sanitizedName = palette.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  let css = `/* ${palette.name} - ${palette.mode} color palette */\n`;
  css += `/* Created: ${new Date(palette.createdAt).toLocaleDateString()} */\n`;
  if (palette.description) {
    css += `/* Description: ${palette.description} */\n`;
  }
  css += `\n`;

  palette.colors.forEach((color, index) => {
    css += `.${sanitizedName}-color-${index + 1} {\n`;
    css += `  color: ${color};\n`;
    css += `}\n\n`;

    css += `.${sanitizedName}-bg-${index + 1} {\n`;
    css += `  background-color: ${color};\n`;
    css += `}\n\n`;
  });

  return css.trim();
}

/**
 * Generates CSS custom properties (variables) for modern CSS workflows.
 * Ideal for CSS frameworks and design systems.
 */
export function exportAsCSSVariables(palette: StoredPalette): string {
  const sanitizedName = palette.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  let css = `/* ${palette.name} - ${palette.mode} color palette */\n`;
  css += `/* Created: ${new Date(palette.createdAt).toLocaleDateString()} */\n`;
  if (palette.description) {
    css += `/* Description: ${palette.description} */\n`;
  }
  css += `\n:root {\n`;

  palette.colors.forEach((color, index) => {
    css += `  --${sanitizedName}-${index + 1}: ${color};\n`;
  });

  css += `}\n\n`;

  // Add utility comment
  css += `/* Usage examples:\n`;
  css += ` * color: var(--${sanitizedName}-1);\n`;
  css += ` * background-color: var(--${sanitizedName}-2);\n`;
  css += ` */`;

  return css;
}

/**
 * Generates plain text export with palette information.
 * Good for sharing in documentation, notes, or plain text environments.
 */
export function exportAsText(palette: StoredPalette): string {
  let text = `${palette.name.toUpperCase()}\n`;
  text += `${"=".repeat(palette.name.length)}\n\n`;

  if (palette.description) {
    text += `Description: ${palette.description}\n`;
  }
  text += `Mode: ${palette.mode}\n`;
  text += `Created: ${new Date(palette.createdAt).toLocaleDateString()}\n`;

  if (palette.keywords.length > 0) {
    text += `Keywords: ${palette.keywords.join(", ")}\n`;
  }

  text += `\nColors (${palette.colors.length}):\n`;
  text += `${"-".repeat(15)}\n`;

  palette.colors.forEach((color, index) => {
    text += `${String(index + 1).padStart(2)}. ${color}\n`;
  });

  return text;
}

/**
 * Main export function that handles all format types.
 * Provides a unified interface for palette export operations.
 */
export function exportPalette(palette: StoredPalette, format: ExportFormat): string {
  switch (format) {
    case "json":
      return exportAsJSON(palette);
    case "css":
      return exportAsCSS(palette);
    case "css-variables":
      return exportAsCSSVariables(palette);
    case "txt":
      return exportAsText(palette);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Gets the appropriate file extension for an export format.
 */
export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case "json":
      return "json";
    case "css":
    case "css-variables":
      return "css";
    case "txt":
      return "txt";
    default:
      return "txt";
  }
}

/**
 * Gets a user-friendly display name for an export format.
 */
export function getFormatDisplayName(format: ExportFormat): string {
  switch (format) {
    case "json":
      return "JSON";
    case "css":
      return "CSS Classes";
    case "css-variables":
      return "CSS Variables";
    case "txt":
      return "Plain Text";
    default:
      return format;
  }
}
