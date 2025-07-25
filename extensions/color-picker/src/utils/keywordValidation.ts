/**
 * Keyword validation utilities for the Color Palette Storage extension.
 *
 * Provides validation functions for keyword input to ensure quality and consistency.
 */

/**
 * Validates if a keyword meets the required criteria.
 *
 * Validation rules:
 * - Length between 2-20 characters
 * - Only alphanumeric characters and hyphens allowed
 * - Cannot start or end with a hyphen
 * - Cannot be empty or only whitespace
 *
 * @param keyword - The keyword string to validate
 * @returns True if the keyword is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidKeyword("blue");       // true
 * isValidKeyword("ocean-blue"); // true
 * isValidKeyword("a");          // false (too short)
 * isValidKeyword("very-very-very-long-keyword"); // false (too long)
 * isValidKeyword("-blue");      // false (starts with hyphen)
 * isValidKeyword("blue!");      // false (invalid character)
 * ```
 */
export const isValidKeyword = (keyword: string): boolean => {
  if (!keyword || typeof keyword !== "string") return false;

  const trimmed = keyword.trim();
  if (!trimmed) return false;

  // Length validation (2-20 characters)
  if (trimmed.length < 2 || trimmed.length > 20) return false;

  // Character validation (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(trimmed)) return false;

  // Cannot start or end with hyphen
  if (trimmed.startsWith("-") || trimmed.endsWith("-")) return false;

  return true;
};

/**
 * Filters an array of keywords, keeping only valid ones.
 *
 * @param keywords - Array of keyword strings to filter
 * @returns Array containing only valid keywords
 */
export const filterValidKeywords = (keywords: string[]): string[] => {
  return keywords.filter(isValidKeyword);
};
