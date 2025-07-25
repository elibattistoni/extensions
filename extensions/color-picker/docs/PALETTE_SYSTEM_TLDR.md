# Color Palette System - TLDR

> **Quick reference guide for the Color Palette Management System**

## What It Does

Extends Raycast's Color Picker with professional palette creation and management:

✅ **Multi-color selection** from history/AI colors  
✅ **Smart form** with draft restoration  
✅ **Global keyword management** with validation  
✅ **HEX-only validation** with clear error messages  
✅ **Intelligent toast notifications** based on actual results

## Key Features

### 🎨 **Palette Creation**

- Select multiple colors → Create palette
- AI prompt integration (short = name, long = description)
- Dynamic color fields (add/remove as needed)
- Auto-focus and draft restoration

### 🏷️ **Smart Keywords**

- Global keyword storage shared across palettes
- Add multiple: `keyword1, keyword2, keyword3`
- Remove existing: `!old-keyword, new-keyword`
- Validation: 2-20 chars, alphanumeric + hyphens only

### 🔔 **Intelligent Feedback**

- **Green Success**: "Keywords added: ocean, sunset"
- **Yellow Warning**: "2 keywords updated: 1 invalid skipped"
- **Red Error**: "Invalid keywords: x - must be 2-20 chars, alphanumeric + hyphens only"

## Quick Usage

### Basic Palette Creation

1. **From History**: Select colors → ⌘+K → "Save Color Palette"
2. **From AI**: Generate colors → Select some → ⌘+K → "Save Color Palette"
3. **Manual**: Open "Save Color Palette" → Fill form

### Keyword Management

```
ocean, sunset, nature     → Adds 3 keywords
!old-color, new-color     → Removes "old-color", adds "new-color"
valid, x, existing-tag    → Adds "valid", warns about "x" and duplicate
```

## File Structure

```
src/
├── save-color-palette.tsx           # Main form
├── components/
│   ├── KeywordsSection.tsx         # Keyword UI with dual interface
│   ├── ColorFieldsSection.tsx     # Dynamic color fields
│   └── ColorPaletteActions.tsx    # Form actions
├── hooks/
│   ├── useSelection.ts             # Multi-selection (ID-based)
│   ├── useKeywords.ts             # Global keyword management
│   ├── useColorFields.ts          # Dynamic field management
│   ├── usePaletteSubmission.ts    # Form submission logic
│   └── useRealTimeFocus.ts        # Focus tracking for UX
└── types.ts                       # All type definitions
```

## Architecture Highlights

### 🎯 **Custom Hooks Pattern**

Each hook has single responsibility:

- `useSelection`: ID-based selection (avoids object reference issues)
- `useKeywords`: Global storage + smart parsing
- `useColorFields`: Dynamic field management
- `usePaletteSubmission`: Form submission logic
- `useRealTimeFocus`: Enhanced UX with focus tracking

### 🛡️ **Robust Validation**

- **HEX Colors**: Strict `#RRGGBB` format only
- **Keywords**: 2-20 chars, alphanumeric + hyphens
- **Form Fields**: Name required, description optional
- **Real-time feedback**: No misleading success messages

### ⚡ **Performance Optimizations**

- Memoized form initialization
- Race condition prevention
- Efficient state management
- Stale closure prevention with refs

## Common Patterns

### Smart Form Initialization

```tsx
// Priority: drafts → selected colors → defaults
const initialValues = useMemo(() => {
  if (draftValues) return draftValues; // Highest priority
  if (selectedColors.length > 0) return fromSelection; // Medium priority
  return defaultValues; // Fallback
}, [draftValues, selectedColors]);
```

### Race Condition Prevention

```tsx
// ❌ Race condition
addColorField(); // Async state update
const fieldId = `color${colorFieldCount + 1}`; // Stale value!

// ✅ Safe approach
const fieldId = `color${colorFieldCount + 1}`; // Pre-calculate
addColorField(); // Then update state
```

### ID-Based Selection

```tsx
// ❌ Object reference issues
const [selected, setSelected] = useState<Set<ColorItem>>(new Set());

// ✅ Reliable ID tracking
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const isSelected = selectedIds.has(item.id);
```

## Toast Message Matrix

| Scenario         | Style      | Example                                    |
| ---------------- | ---------- | ------------------------------------------ |
| All invalid      | 🔴 Failure | "Invalid keywords: x - must be 2-20 chars" |
| All duplicates   | 🟡 Success | "No new keywords: blue, red already exist" |
| Partial success  | 🟡 Success | "2 keywords updated: 1 invalid skipped"    |
| Complete success | 🟢 Success | "Keywords added: ocean, sunset"            |

## Troubleshooting

**Selection not working?** → Check if using ID-based tracking  
**Focus issues?** → Verify race condition prevention  
**Wrong toast messages?** → Use `KeywordUpdateResult` for precise feedback  
**Draft restoration broken?** → Check initialization priority system

## Next Steps

After mastering the basics:

1. **View Palettes**: Browse and manage saved palettes
2. **Advanced Features**: Import/export, collections, search
3. **Customization**: Extend validation rules, add new field types

---

**🚀 Ready to use!** The system works out of the box with intelligent defaults and comprehensive error handling.

_For detailed implementation details, see [PALETTE_SYSTEM_GUIDE.md](./PALETTE_SYSTEM_GUIDE.md)_
