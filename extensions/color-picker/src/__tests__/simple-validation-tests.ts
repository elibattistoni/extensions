/**
 * Tests for form validation utilities
 * Run with: npx ts-node src/__tests__/simple-validation-tests.ts
 */

import { isValidColor } from "../utils/isValidColor";
import { isValidKeyword } from "../utils/keywordValidation";

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

console.log("🧪 Running Validation Tests\n");

// Hex Color Validation Tests
runTest("Valid hex colors are accepted", () => {
  assert(isValidColor("#FF0000"), "Should accept #FF0000");
  assert(isValidColor("#00ff00"), "Should accept lowercase #00ff00");
  assert(isValidColor("#0000FF"), "Should accept #0000FF");
  assert(isValidColor("#fff"), "Should accept short form #fff");
  assert(isValidColor("#ABC"), "Should accept short form #ABC");
  assert(isValidColor("#123456"), "Should accept #123456");
});

runTest("Invalid hex colors are rejected", () => {
  assert(!isValidColor("FF0000"), "Should reject missing #");
  assert(!isValidColor("#GG0000"), "Should reject invalid characters");
  assert(!isValidColor("#FF00"), "Should reject incomplete hex");
  assert(!isValidColor("#FF000000"), "Should reject 8-character hex");
  assert(!isValidColor(""), "Should reject empty string");
  assert(!isValidColor("#"), "Should reject just #");
  assert(!isValidColor("red"), "Should reject color names");
  assert(!isValidColor("rgb(255,0,0)"), "Should reject RGB format");
});

// Keyword Validation Tests
runTest("Valid keywords are accepted", () => {
  assert(isValidKeyword("ocean"), "Should accept simple word");
  assert(isValidKeyword("ocean-blue"), "Should accept hyphenated word");
  assert(isValidKeyword("color123"), "Should accept word with numbers");
  assert(isValidKeyword("UI"), "Should accept uppercase");
  assert(isValidKeyword("web-design"), "Should accept multiple hyphens");
  assert(isValidKeyword("aa"), "Should accept minimum length");
  assert(isValidKeyword("a".repeat(20)), "Should accept maximum length");
  assert(isValidKeyword("123"), "Should accept numbers only (valid according to rules)");
  assert(isValidKeyword("HTML5"), "Should accept alphanumeric mix");
});

runTest("Invalid keywords are rejected", () => {
  assert(!isValidKeyword("a"), "Should reject single character");
  assert(!isValidKeyword("a".repeat(21)), "Should reject too long");
  assert(!isValidKeyword("ocean blue"), "Should reject spaces");
  assert(!isValidKeyword("ocean_blue"), "Should reject underscores");
  assert(!isValidKeyword("ocean@blue"), "Should reject special characters");
  assert(!isValidKeyword("ocean.blue"), "Should reject periods");
  assert(!isValidKeyword(""), "Should reject empty string");
  assert(!isValidKeyword("-ocean"), "Should reject starting with hyphen");
  assert(!isValidKeyword("ocean-"), "Should reject ending with hyphen");
});

runTest("Edge case keywords", () => {
  assert(!isValidKeyword("--"), "Should reject double hyphen");
  assert(!isValidKeyword("a-"), "Should reject ending hyphen even if valid length");
  assert(!isValidKeyword("-a"), "Should reject starting hyphen even if valid length");
  assert(isValidKeyword("a-b"), "Should accept minimal valid hyphenated word");
  assert(isValidKeyword("HTML5"), "Should accept alphanumeric");
  assert(isValidKeyword("CSS3"), "Should accept CSS3");
});

console.log("\n🎉 All validation tests completed!");
