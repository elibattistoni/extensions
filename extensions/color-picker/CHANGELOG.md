# Color Picker Changelog

## [Color Palette Management System] - {PR_MERGE_DATE}

### Added

- **Comprehensive Palette Management**: Create, edit, and organize color palettes with names, descriptions, and keywords
- **Multi-Format Export System**: Export palettes as JSON, CSS Classes, CSS Variables, or Plain Text
- **Smart Palette Creation**: Build palettes from selected colors in history or color wheel
- **Advanced Search & Organization**: Find palettes by name, description, or keywords
- **Light/Dark Mode Support**: Classify palettes by theme compatibility
- **In-Place Editing**: Modify palette details without losing data
- **Draft System**: Temporary storage prevents data loss during editing
- **Comprehensive Validation**: Real-time validation with specific error messages
- **Clipboard Integration**: One-click export to clipboard with success notifications
- **Keyboard Shortcuts**: Full keyboard navigation for power users (⌘+X for export, ⌘+E for edit)

### Enhanced

- **Color History Integration**: Seamless workflow from picked colors to palette creation
- **Menu Bar Features**: Quick access to palettes alongside recent colors
- **Cross-Extension API**: Extended API to support palette operations
- **User Experience**: Improved navigation, error handling, and visual feedback
- **Documentation**: Comprehensive guides for users and developers

### Technical Improvements

- **Type Safety**: Full TypeScript coverage with comprehensive type definitions
- **Performance**: Optimized storage and retrieval for large color collections
- **Error Handling**: Graceful failure recovery with user-friendly messages
- **Testing**: Comprehensive test suite with 20+ test cases covering all functionality
- **Code Quality**: Enhanced JSDoc documentation and consistent code patterns

### Developer Features

- **Testing Framework**: Simple, dependency-free test runner for reliable quality assurance
- **Export Utilities**: Modular export system easily extensible for new formats
- **Validation Engine**: Reusable validation functions for colors and metadata
- **Custom Hooks**: Sophisticated form management with race condition prevention

This major update transforms the Color Picker from a simple color selection tool into a comprehensive color management system suitable for professional design and development workflows.

## [Bugfix] - 2025-06-05

- Add a new callback return value `formattedColor` to return the color in the user's preferred format
- Fix an issue where the callback hex color was not being returned correctly
- Bump all dependencies to the latest

## [Enhancement] - 2025-03-10

- Add the color format dropdown option to the `Convert Color` command.

## [Extract Color] - 2025-02-25

- Select image from finder
- Run `Extract Color` command from Raycast
- Get color palette from the image

## [Accessibility] - 2025-02-13

- Add support for showing color name after picking color

## [Enhancement] - 2024-11-25

- Update README with FAQs

## [Enhancement] - 2024-10-04

- Add Color Names command
- Bump all dependencies to the latest

## [Enhancement] - 2024-09-02

- Improved the `Organize Colors` command to dynamically fetch the frontmost application and display its icon in the paste action.

## [Cross-Extension] - 2024-07-09

- Bump dependencies
- Expose Color Wheel ability through [Raycast Cross-Extension Conventions](https://github.com/LitoMore/raycast-cross-extension-conventions)
- Update API documentation

## [Enhancement] - 2024-06-30

- Add "Color Wheel" command

## [Enhancement] - 2024-06-07

- Fix bug with OKLCH/LCH conversion

## [Enhancement] - 2024-06-07

- Update OKLCH & LCH color formats to use percentage for lightness

## [Enhancement] - 2024-05-31

- Add support for rgb, rgb %, oklch, lch and p3 color formats
- Add "Convert Color" command
- Update `Generate Colors` command to respect the preferred color format

## [Generate Colors using AI] - 2024-05-23

- Add a new `Generate Colors` command
- Group `Copy As...` actions into a single submenu
- Remember the user's choice when deleting a color from the history

## [Cross-Extension] - 2024-05-15

- Expose extension ability with [Raycast Cross-Extension Conventions](https://github.com/LitoMore/raycast-cross-extension-conventions)

## [Enhancement] - 2024-03-08

- Added HEX without prefix (#) color format

## [Fix] - 2024-03-06

- Resolved an issue where the color in the Menu Bar was not displayed correctly.

## [Fixes] - 2024-02-26

- Make sure that colors picked on a P3 display are converted to sRGB when displayed as hex
- Added different actions to copy colors in different formats directly
- Fixed a bug where setting a custom title overwrote other colors

## [Enhancement] - 2024-02-26

- Added support for setting a title

## [New Swift Macro] - 2024-02-16

- Upgrade to the latest version of Swift Macros

## [Enhancements] - 2023-11-30

- Now using Raycast Swift Macro instead of manually compiling

## [Enhancement] - 2023-11-17

- Added HEX color to HUD when picking

## [Maintenance] - 2023-09-15

- Fixed handling of undefined which was introduced with additional settings
- Cleaned up the code

## [Fix] - 2023-02-17

- Fixed an error when picking a color when the menubar command is disabled

## [Initial Version] - 2023-02-08
