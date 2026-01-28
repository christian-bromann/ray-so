/**
 * Shared modules for MCP server
 * Re-exports all shared utilities for convenient importing
 */

// Theme definitions and utilities
export {
  THEMES,
  convertToShikiTheme,
  getVisibleThemeIds,
  getAllThemeIds,
  type Theme,
  type Font,
  type ShikiSyntaxObject,
  type ThemeCSSProperties,
} from "./themes";

// Language definitions
export { LANGUAGES, getAllLanguageIds, getLanguagesSortedByName, type Language } from "./languages";

// Theme CSS utilities
export {
  createCssVariablesTheme,
  createRayShikiTheme,
  themeCSSToInlineStyle,
  generateThemeCSSBlock,
  type CssVariablesThemeOptions,
  type ThemeRegistration,
} from "./theme-css";

// Validation helpers
export {
  isValidThemeId,
  isValidLanguageId,
  isValidPadding,
  isValidExportSize,
  isValidHighlightedLines,
  isValidCode,
  validateCodeImageParams,
  VALID_PADDINGS,
  VALID_EXPORT_SIZES,
  type ValidPadding,
  type ValidExportSize,
  type ValidationResult,
} from "./validators";
