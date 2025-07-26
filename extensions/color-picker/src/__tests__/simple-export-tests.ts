/**
 * Simple test runner for palette export functionality
 * Run with: npx ts-node src/__tests__/simple-export-tests.ts
 */

import { StoredPalette } from "../types";
import {
  exportAsCSS,
  exportAsCSSVariables,
  exportAsJSON,
  exportAsText,
  exportPalette,
  getFileExtension,
  getFormatDisplayName,
} from "../utils/exportPalette";

// Simple test utilities
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTest(name: string, testFn: () => void) {
  try {
    testFn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

// Test data
const mockPalette: StoredPalette = {
  id: "test-123",
  name: "Ocean Vibes",
  description: "Calm blues and greens inspired by the ocean",
  mode: "light",
  keywords: ["ocean", "nature", "calm"],
  colors: ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D"],
  createdAt: "2025-01-19T10:00:00.000Z",
};

console.log("🧪 Running Export Palette Tests\n");

// JSON Export Tests
runTest("JSON export includes all metadata", () => {
  const result = exportAsJSON(mockPalette);
  const parsed = JSON.parse(result);

  assert(parsed.name === "Ocean Vibes", "Name should match");
  assert(parsed.description === "Calm blues and greens inspired by the ocean", "Description should match");
  assert(parsed.mode === "light", "Mode should match");
  assert(JSON.stringify(parsed.keywords) === JSON.stringify(["ocean", "nature", "calm"]), "Keywords should match");
  assert(
    JSON.stringify(parsed.colors) === JSON.stringify(["#2E86AB", "#A23B72", "#F18F01", "#C73E1D"]),
    "Colors should match",
  );
  assert(parsed.exportFormat === "JSON", "Export format should be JSON");
  assert(typeof parsed.exportedAt === "string", "Export date should be present");
});

runTest("JSON export is well-formatted", () => {
  const result = exportAsJSON(mockPalette);
  assert(result.includes("\n"), "Should contain newlines");
  assert(result.includes("  "), "Should contain indentation");
});

// CSS Export Tests
runTest("CSS export generates proper class names", () => {
  const result = exportAsCSS(mockPalette);
  assert(result.includes(".ocean-vibes-color-1"), "Should contain color class");
  assert(result.includes(".ocean-vibes-bg-1"), "Should contain background class");
  assert(result.includes("color: #2E86AB"), "Should contain color property");
  assert(result.includes("background-color: #2E86AB"), "Should contain background-color property");
});

runTest("CSS export includes metadata comments", () => {
  const result = exportAsCSS(mockPalette);
  assert(result.includes("/* Ocean Vibes - light color palette */"), "Should contain title comment");
  assert(result.includes("/* Created:"), "Should contain creation date comment");
  assert(
    result.includes("/* Description: Calm blues and greens inspired by the ocean */"),
    "Should contain description comment",
  );
});

// CSS Variables Tests
runTest("CSS Variables export generates custom properties", () => {
  const result = exportAsCSSVariables(mockPalette);
  assert(result.includes(":root {"), "Should contain :root selector");
  assert(result.includes("--ocean-vibes-1: #2E86AB"), "Should contain CSS variable");
  assert(result.includes("--ocean-vibes-2: #A23B72"), "Should contain second CSS variable");
});

runTest("CSS Variables include usage examples", () => {
  const result = exportAsCSSVariables(mockPalette);
  assert(result.includes("/* Usage examples:"), "Should contain usage examples");
  assert(result.includes("color: var(--ocean-vibes-1)"), "Should contain example usage");
});

// Text Export Tests
runTest("Text export creates readable format", () => {
  const result = exportAsText(mockPalette);
  assert(result.includes("OCEAN VIBES"), "Should contain uppercase title");
  assert(result.includes("Description: Calm blues and greens inspired by the ocean"), "Should contain description");
  assert(result.includes("Mode: light"), "Should contain mode");
  assert(result.includes("Keywords: ocean, nature, calm"), "Should contain keywords");
  assert(result.includes("Colors (4):"), "Should contain color count");
});

runTest("Text export lists all colors", () => {
  const result = exportAsText(mockPalette);
  assert(result.includes(" 1. #2E86AB"), "Should contain first color");
  assert(result.includes(" 2. #A23B72"), "Should contain second color");
  assert(result.includes(" 3. #F18F01"), "Should contain third color");
  assert(result.includes(" 4. #C73E1D"), "Should contain fourth color");
});

// Main Export Function Tests
runTest("Main export function delegates correctly", () => {
  const jsonResult = exportPalette(mockPalette, "json");
  const cssResult = exportPalette(mockPalette, "css");
  const cssVarResult = exportPalette(mockPalette, "css-variables");
  const txtResult = exportPalette(mockPalette, "txt");

  assert(jsonResult.includes('"exportFormat": "JSON"'), "JSON format should work");
  assert(cssResult.includes(".ocean-vibes-color-1"), "CSS format should work");
  assert(cssVarResult.includes("--ocean-vibes-1:"), "CSS Variables format should work");
  assert(txtResult.includes("OCEAN VIBES"), "Text format should work");
});

runTest("Export function throws error for invalid format", () => {
  try {
    exportPalette(mockPalette, "invalid" as any);
    assert(false, "Should have thrown an error");
  } catch (error) {
    assert(error instanceof Error && error.message.includes("Unsupported export format"), "Should throw proper error");
  }
});

// Utility Functions Tests
runTest("File extension utility works correctly", () => {
  assert(getFileExtension("json") === "json", "JSON extension should be json");
  assert(getFileExtension("css") === "css", "CSS extension should be css");
  assert(getFileExtension("css-variables") === "css", "CSS Variables extension should be css");
  assert(getFileExtension("txt") === "txt", "Text extension should be txt");
});

runTest("Display name utility works correctly", () => {
  assert(getFormatDisplayName("json") === "JSON", "JSON display name should be JSON");
  assert(getFormatDisplayName("css") === "CSS Classes", "CSS display name should be CSS Classes");
  assert(
    getFormatDisplayName("css-variables") === "CSS Variables",
    "CSS Variables display name should be CSS Variables",
  );
  assert(getFormatDisplayName("txt") === "Plain Text", "Text display name should be Plain Text");
});

// Edge Cases Tests
runTest("Handles palette names with special characters", () => {
  const specialPalette: StoredPalette = {
    ...mockPalette,
    name: "Test @ Palette #1!",
  };

  const cssResult = exportAsCSS(specialPalette);
  const cssVarResult = exportAsCSSVariables(specialPalette);

  assert(cssResult.includes(".test---palette--1-"), "CSS should sanitize special characters");
  assert(cssVarResult.includes("--test---palette--1-"), "CSS Variables should sanitize special characters");
});

runTest("Handles empty color arrays", () => {
  const emptyPalette: StoredPalette = {
    ...mockPalette,
    colors: [],
  };

  const jsonResult = exportAsJSON(emptyPalette);
  const txtResult = exportAsText(emptyPalette);

  assert(jsonResult.includes('"colors": []'), "JSON should handle empty colors");
  assert(txtResult.includes("Colors (0):"), "Text should handle empty colors");
});

runTest("Handles single color palette", () => {
  const singleColorPalette: StoredPalette = {
    ...mockPalette,
    colors: ["#FF0000"],
  };

  const result = exportAsCSS(singleColorPalette);
  assert(result.includes(".ocean-vibes-color-1"), "Should contain first color class");
  assert(!result.includes(".ocean-vibes-color-2"), "Should not contain second color class");
});

console.log("\n🎉 All tests completed!");
