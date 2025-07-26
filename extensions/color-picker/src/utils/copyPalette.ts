import { CopyFormat, StoredPalette } from "../types";

/**
 * Generates JSON copy of palette data with complete metadata.
 * Useful for sharing palettes between users or backing up palette data.
 */
export function copyAsJSON(palette: StoredPalette): string {
  const copyData = {
    name: palette.name,
    description: palette.description,
    mode: palette.mode,
    keywords: palette.keywords,
    colors: palette.colors,
    createdAt: palette.createdAt,
    copiedAt: new Date().toISOString(),
    copyFormat: "JSON",
  };

  return JSON.stringify(copyData, null, 2);
}

/**
 * Generates CSS color definitions using class selectors.
 * Perfect for integrating palette colors into web projects.
 */
export function copyAsCSS(palette: StoredPalette): string {
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
export function copyAsCSSVariables(palette: StoredPalette): string {
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
export function copyAsText(palette: StoredPalette): string {
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
 * Main copy function that handles all format types.
 * Provides a unified interface for palette copy operations.
 */
export function copyPalette(palette: StoredPalette, format: CopyFormat): string {
  switch (format) {
    case "json":
      return copyAsJSON(palette);
    case "css":
      return copyAsCSS(palette);
    case "css-variables":
      return copyAsCSSVariables(palette);
    case "txt":
      return copyAsText(palette);
    default:
      throw new Error(`Unsupported copy format: ${format}`);
  }
}

/**
 * Gets the appropriate file extension for a format.
 */
export function getFileExtension(format: CopyFormat): string {
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
 * Gets a user-friendly display name for a format.
 */
export function getFormatDisplayName(format: CopyFormat): string {
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
