# Color Picker Extension

A simple system-wide color picker. The color picker can be triggered with a standalone command or as part of the menu bar command. The menu bar shows the last nine picked colors. The Organize Colors command can be used to see all colors.

[![raycast-cross-extension-badge]][raycast-cross-extension-link]

## Key Features

- Pick a color on your desktop
- Access your colors from the menu bar
- Organize your colors
- Generate colors using AI
- Create and manage color palettes
- Edit existing color palettes
- Export color palettes in multiple formats
- Pick a color using AI
- Pick a color with color wheel
- Convert any color to a different format
- Get the color name for a hex code

## Cross-Extension API

This extensions follows [Raycast Cross-Extension Conventions][raycast-cross-extension-link].

You can use `crossLaunchCommand` to use the picker color result.

### Launch Context Options

#### `copyToClipboard`

Type: `boolean`\
Default: `false`

Copy to clipboard is disabled by default. Set it to `true` to enable copy action.

#### `callbackLaunchOptions`

Type: `LaunchOptions`\
Default: `undefined`

Use this option to let this extension know what kind of callback needs to be performed when `crossLaunchCommand`.

### Callback Context Options

#### `hex`

Type: `string`

It returns the color picker hex result.

#### `formattedColor`

Type: `string`

It returns the formatted color result. The format can be changed in the preferences of the extension.

### Examples

#### Launch Color Picker

```typescript
import { LaunchType } from "@raycast/api";
import { crossLaunchCommand } from "raycast-cross-extension";

await crossLaunchCommand({
  name: "pick-color",
  type: LaunchType.UserInitiated,
  extensionName: "color-picker",
  ownerOrAuthorName: "thomas",
});
```

#### Launch Color Wheel

```typescript
import { LaunchType } from "@raycast/api";
import { crossLaunchCommand } from "raycast-cross-extension";

await crossLaunchCommand({
  name: "color-wheel",
  type: LaunchType.UserInitiated,
  extensionName: "color-picker",
  ownerOrAuthorName: "thomas",
});
```

#### Receive Callback Result

```typescript
import { LaunchProps } from "@raycast/api";
import { useEffect } from "react";

type LaunchContext = {
  hex?: string;
};

export default function Command({ launchContext = {} }: LaunchProps<{ launchContext?: LaunchContext }>) {
  useEffect(() => {
    if (launchContext.hex) {
      console.log(launchContext.hex);
    }
  }, []);
}
```

## Who's using Color Picker Cross-Extension API

- [Badges - shields.io](https://raycast.com/litomore/badges) - Concise, consistent, and legible badges

## Color Palette Management

The Color Picker extension now includes comprehensive palette management features:

### **Creating Palettes**

- Use the `save-color-palette` command to create new palettes
- Export selected colors from `organize-colors` or `generate-colors` directly to a new palette
- Add names, descriptions, and keywords for easy organization
- Support for both light and dark palette modes

### **Managing Palettes**

- Browse all palettes with the `view-color-palettes` command
- Edit existing palettes while preserving their original creation date
- Duplicate palettes to create instant copies
- Delete palettes you no longer need
- Search through palettes by name, description, or keywords

### Professional Export System

Export your color palettes in multiple formats for different development workflows:

#### Export Formats Available:

- **JSON**: Complete metadata for data interchange
- **CSS Classes**: Ready-to-use CSS with color and background variants
- **CSS Variables**: Modern CSS custom properties for design systems
- **Plain Text**: Human-readable format for documentation

#### Export Examples:

**CSS Variables:**

```css
:root {
  --ocean-vibes-1: #2e86ab;
  --ocean-vibes-2: #a23b72;
  --ocean-vibes-3: #f18f01;
}
```

**CSS Classes:**

```css
.ocean-vibes-color-1 {
  color: #2e86ab;
}
.ocean-vibes-bg-1 {
  background-color: #2e86ab;
}
```

**JSON:**

```json
{
  "name": "Ocean Vibes",
  "description": "Calm blues and greens inspired by the ocean",
  "colors": ["#2e86ab", "#a23b72", "#f18f01"],
  "keywords": ["ocean", "nature", "calm"],
  "mode": "light"
}
```

### Palette Workflow

1. **Pick Colors**: Use existing color picker tools to gather colors
2. **Create Palette**: Select multiple colors and run "Save Color Palette"
3. **Add Metadata**: Include name, description, keywords, and theme mode
4. **Export**: Choose your preferred format (⌘+X) and copy to clipboard

### Integration with Existing Features

- **Color History**: All picked colors are available for palette creation
- **Menu Bar**: Quick access to recent palettes alongside colors
- **Cross-Extension API**: Palette operations work with the existing API structure

## Development

For technical implementation details, architecture information, and contribution guidelines, see [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md).

## License

MIT

[raycast-cross-extension-link]: https://github.com/LitoMore/raycast-cross-extension-conventions
[raycast-cross-extension-badge]: https://shields.io/badge/Raycast-Cross--Extension-eee?labelColor=FF6363&logo=raycast&logoColor=fff&style=flat-square

```

```
