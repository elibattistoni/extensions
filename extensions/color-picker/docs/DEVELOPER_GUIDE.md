# Color Picker Extension - Developer Guide

> **Technical implementation guide for developers, maintainers, and contributors**

For user-facing information and basic setup, see the main [README.md](../README.md).

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ColorConvert.tsx     # Color format conversion interface
│   ├── ColorNames.tsx       # Color name lookup and display
│   ├── CopyAsSubmenu.tsx    # Copy action submenu component
│   └── EditTitle.tsx        # Inline title editing component
├── hooks/               # Custom React hooks
│   └── usePaletteSubmission.ts  # Palette form logic and submission
├── utils/               # Utility functions and helpers
│   └── exportPalette.ts     # Export functionality for multiple formats
├── __tests__/           # Test files
│   ├── simple-export-tests.ts      # Export functionality tests (15 cases)
│   └── simple-validation-tests.ts  # Validation logic tests (5 cases)
├── [feature-files].tsx # Main feature components
└── types.ts            # TypeScript type definitions
```

_[Screenshot: VS Code project structure]_

## 🏗️ Architecture Overview

### **Component Hierarchy**

```
App Root
├── Color Picker Commands
│   ├── pick-color.ts          # Screen color picking
│   ├── color-wheel.tsx        # Visual color selection
│   ├── convert-color.tsx      # Format conversion
│   └── menu-bar.tsx          # Menu bar integration
├── Palette Management
│   ├── save-color-palette.tsx # Palette creation/editing
│   ├── view-color-palettes.tsx # Palette viewing/management
│   └── organize-colors.tsx    # Color organization
└── Utility Features
    ├── generate-colors.tsx    # AI color generation
    ├── color-names.tsx       # Color name lookup
    └── extract-color.tsx     # Image color extraction
```

### **Data Flow**

```
User Action → Component → Hook → Utility → Storage → UI Update
     ↓           ↓        ↓       ↓        ↓          ↓
  Pick Color → ColorPicker → usePalette → saveColor → LocalStorage → Toast
```

_[Screenshot: Architecture diagram]_

## 🎨 Feature Implementation

### 1. **Color Picking System**

#### **Core Files:**

- `src/pick-color.ts` - Main color picking logic
- `src/color-wheel.tsx` - Visual color selection interface

#### **Technical Details:**

**Screen Color Picking:**

```typescript
// Leverages Raycast's native screen capture API
const pickedColor = await pickColorFromScreen();
// Returns: { hex: string, rgb: RGB, hsl: HSL }
```

**Color Wheel Implementation:**

- Uses HSB color model for intuitive selection
- Real-time color preview with format conversion
- Keyboard navigation support for accessibility

_[Screenshot: Color wheel interface with technical annotations]_

#### **Key Components:**

**Color Format Conversion** (`src/components/ColorConvert.tsx`):

- Bidirectional conversion between HEX, RGB, HSL, HSB
- Input validation with real-time feedback
- Copy-to-clipboard functionality for all formats

**Integration Points:**

- Saves to color history automatically
- Triggers palette suggestions based on picked colors
- Integrates with menu bar for quick access

---

### 2. **Palette Management System**

#### **Core Files:**

- `src/save-color-palette.tsx` - Palette creation and editing interface
- `src/view-color-palettes.tsx` - Palette viewing and management
- `src/hooks/usePaletteSubmission.ts` - Form logic and data handling
- `src/types.ts` - Type definitions for palette system

#### **Technical Implementation:**

**Palette Data Structure:**

```typescript
interface StoredPalette {
  id: string; // Unique identifier
  name: string; // User-defined name
  description?: string; // Optional description
  colors: string[]; // Array of HEX color values
  keywords: string[]; // Searchable tags
  mode: "light" | "dark" | "universal"; // Theme compatibility
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last modification timestamp
}
```

_[Screenshot: Palette data structure visualization]_

**Form Management Hook** (`src/hooks/usePaletteSubmission.ts`):

```typescript
/**
 * Comprehensive palette form management with validation and submission
 * Features: draft handling, validation, race condition prevention, error handling
 */
const usePaletteSubmission = (selectedColors: string[], editingPalette?: StoredPalette) => {
  // Smart initialization priority: drafts → editing palette → selected colors → defaults
  // Real-time validation with detailed feedback
  // Race condition prevention for rapid submissions
  // Automatic draft cleanup on successful submission
};
```

**Key Features:**

- **Smart Form Initialization**: Priority-based field population
- **Draft System**: Temporary storage prevents data loss
- **Validation Engine**: Real-time validation with specific error messages
- **Race Condition Prevention**: Prevents duplicate submissions
- **Error Recovery**: Graceful handling of submission failures

_[Screenshot: Palette creation form with validation states]_

**Palette Viewing** (`src/view-color-palettes.tsx`):

- List interface with search and filtering
- Inline editing capabilities
- Export integration with format selection
- Bulk operations for palette management

---

### 3. **Export System**

#### **Core Files:**

- `src/utils/exportPalette.ts` - Export logic and format generation

#### **Technical Implementation:**

**Export Architecture:**

```typescript
type ExportFormat = "json" | "css" | "css-variables" | "text";

/**
 * Main export function with format-specific handlers
 * @param palette - The palette to export
 * @param format - Target export format
 * @returns Formatted string ready for clipboard
 */
export const exportPalette = (palette: StoredPalette, format: ExportFormat): string => {
  switch (format) {
    case "json":
      return exportAsJSON(palette);
    case "css":
      return exportAsCSS(palette);
    case "css-variables":
      return exportAsCSSVariables(palette);
    case "text":
      return exportAsText(palette);
  }
};
```

_[Screenshot: Export function architecture diagram]_

**Format-Specific Exporters:**

**JSON Export:**

- Complete metadata preservation
- ISO timestamp formatting
- Export metadata injection
- Proper JSON structure for data interchange

**CSS Classes Export:**

- Sanitized class names (kebab-case)
- Color and background variants
- Comprehensive CSS comments with metadata
- Ready-to-use CSS structure

**CSS Variables Export:**

- Modern CSS custom property format
- Root-level variable declaration
- Usage examples in comments
- Design system compatible structure

**Plain Text Export:**

- Human-readable format
- Structured layout with clear sections
- Copy-friendly formatting
- Documentation-ready output

_[Screenshot: Export format comparison]_

#### **Integration:**

- Seamless clipboard integration via Raycast API
- Success notifications with export details
- Error handling with user-friendly messages
- Keyboard shortcuts for quick access (⌘+X)

---

### 4. **Validation System**

#### **Core Files:**

- `src/utils.ts` - Validation functions and utilities

#### **Technical Implementation:**

**Color Validation:**

```typescript
/**
 * Validates HEX color format (3 or 6 digits)
 * @param color - Color string to validate
 * @returns Boolean indicating validity
 */
export const isValidColor = (color: string): boolean => {
  const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
  return hexPattern.test(color);
};
```

**Keyword Validation:**

```typescript
/**
 * Validates keyword format for palette tagging
 * Rules: 2-20 chars, alphanumeric + hyphens, no consecutive hyphens
 */
export const isValidKeyword = (keyword: string): boolean => {
  return (
    keyword.length >= 2 &&
    keyword.length <= 20 &&
    /^[a-zA-Z0-9-]+$/.test(keyword) &&
    !/--/.test(keyword) &&
    !keyword.startsWith("-") &&
    !keyword.endsWith("-")
  );
};
```

**Form Validation:**

- Real-time validation with immediate feedback
- Specific error messages for each validation rule
- Visual indicators for validation states
- Prevention of invalid form submission

_[Screenshot: Validation feedback in UI]_

---

### 5. **Storage and Data Management**

#### **Local Storage Implementation:**

- Raycast's `LocalStorage` API for persistence
- JSON serialization with type safety
- Automatic migration for data structure changes
- Error handling for storage failures

**Data Operations:**

```typescript
// Palette storage operations
const savePalette = async (palette: StoredPalette): Promise<void> => {
  await LocalStorage.setItem(`palette-${palette.id}`, JSON.stringify(palette));
};

const loadPalettes = async (): Promise<StoredPalette[]> => {
  const items = await LocalStorage.allItems();
  return Object.entries(items)
    .filter(([key]) => key.startsWith("palette-"))
    .map(([_, value]) => JSON.parse(value as string));
};
```

**Color History Management:**

- Automatic deduplication of picked colors
- Timestamp-based ordering
- Configurable history limits
- Efficient search and retrieval

---

## 🧪 Testing Strategy

### **Testing Approach**

We use a **simple, dependency-free testing approach** that works immediately with TypeScript, perfect for Raycast extensions.

#### **Why Simple Tests?**

- ✅ **No dependencies**: Works with just TypeScript and ts-node
- ✅ **Lightweight**: Custom test runner, minimal setup
- ✅ **Raycast-friendly**: No additional packages in extension bundle
- ✅ **Production-ready**: Tests don't affect the extension build
- ✅ **Fast execution**: No framework overhead

_[Screenshot: Test execution in terminal]_

### **Test Files Structure**

```
src/__tests__/
├── simple-export-tests.ts      # Export functionality (15 test cases)
└── simple-validation-tests.ts  # Validation logic (5 test cases)
```

#### **Custom Test Runner Implementation:**

```typescript
/**
 * Simple assertion function for tests
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }
  console.log(`✅ ${message}`);
}

/**
 * Test runner with error handling and reporting
 */
async function runTest(name: string, testFn: () => void | Promise<void>): Promise<void> {
  try {
    await testFn();
    console.log(`🧪 ${name}: ✅ PASS`);
  } catch (error) {
    console.log(`🧪 ${name}: ❌ FAIL`);
    console.log(`   Error: ${error.message}`);
  }
}
```

### **Test Coverage**

#### **Export Functionality Tests** (15 test cases):

**JSON Export Tests:**

- Complete metadata export
- Proper timestamp formatting
- Export metadata injection
- Invalid palette handling

**CSS Export Tests:**

- Class name sanitization
- Color and background variants
- Comment generation
- Special character handling

**CSS Variables Tests:**

- Variable name formatting
- Root-level declaration
- Usage comment generation
- Edge case handling

**Utility Function Tests:**

- File extension generation
- Display name formatting
- Empty palette handling
- Single color palettes

_[Screenshot: Test execution results]_

#### **Validation Tests** (5 test cases):

**Color Validation:**

- Valid HEX formats (3-digit, 6-digit)
- Invalid format rejection
- Edge cases (empty strings, invalid characters)

**Keyword Validation:**

- Length constraints (2-20 characters)
- Character restrictions (alphanumeric + hyphens)
- Format rules (no consecutive hyphens, no leading/trailing hyphens)

### **Running Tests**

```bash
# Export functionality tests
npx ts-node src/__tests__/simple-export-tests.ts

# Validation tests
npx ts-node src/__tests__/simple-validation-tests.ts

# Expected output:
# 🧪 Export Tests: 15/15 ✅ PASS
# 🧪 Validation Tests: 5/5 ✅ PASS
```

### **Test Benefits**

1. **No Build Complexity**: Tests run directly with TypeScript
2. **Production Ready**: No test dependencies in final bundle
3. **Developer Friendly**: Easy to understand and extend
4. **Comprehensive Coverage**: All critical functionality tested
5. **Fast Feedback**: Quick execution for rapid development

---

## 🔧 Development Workflow

### **Setup and Installation**

```bash
# Clone the repository
git clone [repository-url]
cd extensions/color-picker

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### **Code Organization Principles**

1. **Component Separation**: UI components separate from business logic
2. **Custom Hooks**: Reusable logic extracted into hooks
3. **Type Safety**: Comprehensive TypeScript coverage
4. **Error Handling**: Graceful failure recovery throughout
5. **Performance**: Optimized for Raycast's lightweight requirements

### **Adding New Features**

1. **Create Component**: Add new `.tsx` file in appropriate directory
2. **Define Types**: Add TypeScript interfaces in `types.ts`
3. **Add Tests**: Create test cases for new functionality
4. **Update Documentation**: Update relevant documentation files
5. **Test Integration**: Ensure feature works with existing components

### **Code Style Guidelines**

- **TypeScript Strict Mode**: All code must pass strict type checking
- **Functional Components**: Use React functional components with hooks
- **Error Boundaries**: Implement proper error handling and user feedback
- **Accessibility**: Support keyboard navigation and screen readers
- **Performance**: Optimize for quick loading and responsive interactions

_[Screenshot: Code style example with annotations]_

---

## 📚 API Reference

### **Core Types**

```typescript
// Complete type definitions for the extension
interface StoredPalette {
  id: string;
  name: string;
  description?: string;
  colors: string[];
  keywords: string[];
  mode: "light" | "dark" | "universal";
  createdAt: Date;
  updatedAt: Date;
}

type ExportFormat = "json" | "css" | "css-variables" | "text";

interface PaletteFormData {
  name: string;
  description: string;
  keywords: string[];
  mode: "light" | "dark" | "universal";
  colors: string[];
}
```

### **Utility Functions**

```typescript
// Export functionality
exportPalette(palette: StoredPalette, format: ExportFormat): string
getFileExtension(format: ExportFormat): string
getFormatDisplayName(format: ExportFormat): string

// Validation
isValidColor(color: string): boolean
isValidKeyword(keyword: string): boolean

// Storage operations
savePalette(palette: StoredPalette): Promise<void>
loadPalettes(): Promise<StoredPalette[]>
deletePalette(id: string): Promise<void>
```

### **Custom Hooks**

```typescript
// Palette submission management
usePaletteSubmission(selectedColors: string[], editingPalette?: StoredPalette): {
  formData: PaletteFormData;
  setFormData: (data: PaletteFormData) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
}
```

---

## 🚀 Performance Considerations

### **Optimization Strategies**

1. **Lazy Loading**: Components load only when needed
2. **Memoization**: Expensive calculations cached with React.memo
3. **Debounced Search**: Search input debounced to prevent excessive filtering
4. **Efficient Storage**: Minimal data serialization for faster load times
5. **Race Condition Prevention**: Proper async handling in forms and API calls

### **Memory Management**

- **Color History Limits**: Configurable limits prevent memory bloat
- **Palette Cleanup**: Automatic removal of invalid or corrupted data
- **Event Listener Cleanup**: Proper cleanup of event listeners and timers
- **Cache Management**: Intelligent caching with automatic expiration

### **User Experience Optimizations**

- **Instant Feedback**: Immediate visual feedback for all user actions
- **Progressive Loading**: Interface loads incrementally for faster perceived performance
- **Error Recovery**: Graceful degradation when features are unavailable
- **Keyboard Shortcuts**: Full keyboard navigation for power users

_[Screenshot: Performance monitoring dashboard]_

---

## 🐛 Troubleshooting

### **Common Issues**

**Color Picker Not Working:**

- Verify screen recording permissions in macOS System Preferences
- Check Raycast permissions for accessibility features
- Restart Raycast if color picker appears frozen

**Palette Export Failures:**

- Ensure clipboard permissions are granted
- Check for special characters in palette names
- Verify color format validity before export

**Storage Issues:**

- Clear Raycast's local storage if data appears corrupted
- Check available disk space for storage operations
- Verify file permissions for Raycast data directory

### **Debug Information**

**Logging:**

- Enable debug logging in Raycast preferences
- Check console output for error messages
- Monitor storage usage and performance metrics

**Error Reporting:**

- All errors include specific error codes and messages
- Stack traces available in development mode
- User-friendly error messages in production

### **Support Resources**

- **Documentation**: This guide and inline JSDoc comments
- **Issue Tracking**: GitHub issues for bug reports and feature requests
- **Community**: Raycast community forums for user support
- **Development**: Direct developer contact for technical issues

---

This developer guide complements the JSDoc documentation in the codebase and provides comprehensive technical context for anyone working with the Color Picker Extension. For user-facing information and basic setup, see the main [README.md](../README.md).
