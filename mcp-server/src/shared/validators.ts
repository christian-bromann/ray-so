/**
 * Validation helpers for MCP tool inputs.
 */

import { THEMES } from "./themes";
import { LANGUAGES } from "./languages";

/**
 * Valid padding values for code images
 */
export const VALID_PADDINGS = [16, 32, 64, 128] as const;
export type ValidPadding = (typeof VALID_PADDINGS)[number];

/**
 * Valid export size values (pixel ratios)
 */
export const VALID_EXPORT_SIZES = [2, 4, 6] as const;
export type ValidExportSize = (typeof VALID_EXPORT_SIZES)[number];

/**
 * Validates if the given ID is a valid theme ID
 */
export function isValidThemeId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }
  return id in THEMES;
}

/**
 * Validates if the given ID is a valid language ID
 */
export function isValidLanguageId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }
  return id in LANGUAGES;
}

/**
 * Validates if the given value is a valid padding value
 */
export function isValidPadding(value: number): value is ValidPadding {
  return VALID_PADDINGS.includes(value as ValidPadding);
}

/**
 * Validates if the given value is a valid export size
 */
export function isValidExportSize(value: number): value is ValidExportSize {
  return VALID_EXPORT_SIZES.includes(value as ValidExportSize);
}

/**
 * Validates if the given line numbers are valid (positive integers)
 */
export function isValidHighlightedLines(lines: number[]): boolean {
  if (!Array.isArray(lines)) {
    return false;
  }
  return lines.every((line) => Number.isInteger(line) && line > 0);
}

/**
 * Validates code input
 */
export function isValidCode(code: unknown): code is string {
  return typeof code === "string" && code.length > 0;
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates all create_code_image parameters
 */
export function validateCodeImageParams(params: {
  code?: unknown;
  theme?: string;
  language?: string;
  padding?: number;
  exportSize?: number;
  highlightedLines?: number[];
}): ValidationResult {
  // Code is required and must be non-empty string
  if (!isValidCode(params.code)) {
    return {
      valid: false,
      error: "Code is required and must be a non-empty string",
    };
  }

  // Validate theme if provided
  if (params.theme !== undefined && !isValidThemeId(params.theme)) {
    return {
      valid: false,
      error: `Invalid theme ID: "${params.theme}". Use list_themes to see available themes.`,
    };
  }

  // Validate language if provided
  if (params.language !== undefined && !isValidLanguageId(params.language)) {
    return {
      valid: false,
      error: `Invalid language ID: "${params.language}". Use list_languages to see available languages.`,
    };
  }

  // Validate padding if provided
  if (params.padding !== undefined && !isValidPadding(params.padding)) {
    return {
      valid: false,
      error: `Invalid padding value: ${params.padding}. Valid values are: ${VALID_PADDINGS.join(", ")}`,
    };
  }

  // Validate export size if provided
  if (params.exportSize !== undefined && !isValidExportSize(params.exportSize)) {
    return {
      valid: false,
      error: `Invalid export size: ${params.exportSize}. Valid values are: ${VALID_EXPORT_SIZES.join(", ")}`,
    };
  }

  // Validate highlighted lines if provided
  if (params.highlightedLines !== undefined && !isValidHighlightedLines(params.highlightedLines)) {
    return {
      valid: false,
      error: "Invalid highlighted lines. Must be an array of positive integers.",
    };
  }

  return { valid: true };
}
