/**
 * create_code_image MCP Tool
 *
 * Generates beautiful code images/screenshots from code snippets.
 * Uses Playwright for rendering and supports all ray.so themes.
 */

import { z } from "zod";
import {
  validateCodeImageParams,
  VALID_PADDINGS,
  VALID_EXPORT_SIZES,
  type ValidPadding,
  type ValidExportSize,
} from "../shared/validators";
import { generateCodeFrameHtml } from "../renderer/frame-renderer";
import { captureScreenshotFullContent, ScreenshotError } from "../renderer/screenshot";
import { detectLanguage } from "../renderer/language-detection";

/**
 * Input parameters for create_code_image tool
 */
export interface CreateCodeImageInput {
  /**
   * The code to render (required)
   */
  code: string;

  /**
   * Programming language for syntax highlighting (optional)
   * If not specified, language will be auto-detected
   */
  language?: string;

  /**
   * Theme ID to use (optional, default: "vercel")
   */
  theme?: string;

  /**
   * Use dark mode variant (optional, default: true)
   */
  darkMode?: boolean;

  /**
   * Padding around the code frame (optional, default: 64)
   * Valid values: 16, 32, 64, 128
   */
  padding?: ValidPadding;

  /**
   * Show background gradient (optional, default: true)
   */
  background?: boolean;

  /**
   * Show line numbers (optional, default: false)
   */
  lineNumbers?: boolean;

  /**
   * Filename to display in header (optional)
   */
  fileName?: string;

  /**
   * Line numbers to highlight (1-indexed) (optional)
   */
  highlightedLines?: number[];

  /**
   * Export size / pixel ratio (optional, default: 2)
   * Valid values: 2, 4, 6
   */
  exportSize?: ValidExportSize;
}

/**
 * Success result from create_code_image
 */
export interface CreateCodeImageSuccess {
  success: true;
  /**
   * Base64-encoded PNG image data
   */
  image: string;
  /**
   * MIME type of the image
   */
  mimeType: "image/png";
  /**
   * Width of the image in pixels
   */
  width: number;
  /**
   * Height of the image in pixels
   */
  height: number;
}

/**
 * Error result from create_code_image
 */
export interface CreateCodeImageError {
  success: false;
  /**
   * Human-readable error message
   */
  error: string;
  /**
   * Error code for programmatic handling
   */
  errorCode: string;
}

/**
 * Result type for create_code_image
 */
export type CreateCodeImageResult = CreateCodeImageSuccess | CreateCodeImageError;

/**
 * Default values for optional parameters
 */
const DEFAULTS = {
  theme: "vercel",
  darkMode: true,
  padding: 64 as ValidPadding,
  background: true,
  lineNumbers: false,
  exportSize: 2 as ValidExportSize,
};

/**
 * Timeout for image generation (30 seconds)
 */
const GENERATION_TIMEOUT = 30000;

/**
 * Parses PNG header to extract image dimensions.
 * PNG format: bytes 16-19 = width, bytes 20-23 = height (big-endian)
 */
function getPngDimensions(buffer: Buffer): { width: number; height: number } {
  // PNG signature is 8 bytes, then IHDR chunk
  // IHDR chunk: 4 bytes length, 4 bytes "IHDR", then width (4 bytes), height (4 bytes)
  if (buffer.length < 24) {
    return { width: 0, height: 0 };
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return { width, height };
}

/**
 * Creates a code image from the provided input.
 *
 * @param input - The input parameters for code image generation
 * @returns Promise resolving to success result with image data or error result
 */
export async function createCodeImage(input: CreateCodeImageInput): Promise<CreateCodeImageResult> {
  // Validate input parameters
  const validation = validateCodeImageParams({
    code: input.code,
    theme: input.theme,
    language: input.language,
    padding: input.padding,
    exportSize: input.exportSize,
    highlightedLines: input.highlightedLines,
  });

  if (!validation.valid) {
    // Map validation errors to error codes
    let errorCode = "VALIDATION_ERROR";
    if (validation.error?.includes("Code is required")) {
      errorCode = "INVALID_CODE";
    } else if (validation.error?.includes("Invalid theme ID")) {
      errorCode = "INVALID_THEME";
    } else if (validation.error?.includes("Invalid language ID")) {
      errorCode = "INVALID_LANGUAGE";
    } else if (validation.error?.includes("Invalid padding")) {
      errorCode = "INVALID_PADDING";
    } else if (validation.error?.includes("Invalid export size")) {
      errorCode = "INVALID_EXPORT_SIZE";
    } else if (validation.error?.includes("Invalid highlighted lines")) {
      errorCode = "INVALID_HIGHLIGHTED_LINES";
    }

    return {
      success: false,
      error: validation.error || "Invalid input parameters",
      errorCode,
    };
  }

  // Apply defaults
  const theme = input.theme || DEFAULTS.theme;
  const darkMode = input.darkMode ?? DEFAULTS.darkMode;
  const padding = input.padding || DEFAULTS.padding;
  const background = input.background ?? DEFAULTS.background;
  const lineNumbers = input.lineNumbers ?? DEFAULTS.lineNumbers;
  const fileName = input.fileName || "";
  const highlightedLines = input.highlightedLines || [];
  const exportSize = input.exportSize || DEFAULTS.exportSize;

  // Auto-detect language if not specified
  let language = input.language;
  if (!language) {
    const detection = detectLanguage(input.code);
    language = detection.languageId;
  }

  try {
    // Generate HTML for the code frame
    const html = await generateCodeFrameHtml({
      code: input.code,
      theme,
      darkMode,
      language,
      padding,
      background,
      lineNumbers,
      fileName,
      highlightedLines,
    });

    // Capture screenshot with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Image generation timed out after ${GENERATION_TIMEOUT}ms`));
      }, GENERATION_TIMEOUT);
    });

    const screenshotPromise = captureScreenshotFullContent(html, {
      pixelRatio: exportSize,
      timeout: GENERATION_TIMEOUT,
    });

    const buffer = await Promise.race([screenshotPromise, timeoutPromise]);

    // Convert to base64
    const base64Image = buffer.toString("base64");

    // Extract dimensions from PNG
    const dimensions = getPngDimensions(buffer);

    return {
      success: true,
      image: base64Image,
      mimeType: "image/png",
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    // Handle specific error types
    if (error instanceof ScreenshotError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }

    if (error instanceof Error && error.message.includes("timed out")) {
      return {
        success: false,
        error: "Image generation timed out. Please try with a smaller code snippet.",
        errorCode: "TIMEOUT",
      };
    }

    return {
      success: false,
      error: `Failed to generate image: ${error instanceof Error ? error.message : String(error)}`,
      errorCode: "GENERATION_FAILED",
    };
  }
}

/**
 * Zod schema for create_code_image input parameters
 */
export const createCodeImageZodSchema = {
  code: z.string().describe("The code to render as an image (required)"),
  language: z
    .string()
    .optional()
    .describe(
      "Programming language for syntax highlighting. If not specified, language will be auto-detected. Use list_languages to see available options.",
    ),
  theme: z
    .string()
    .optional()
    .describe('Theme ID for styling the code frame (default: "vercel"). Use list_themes to see available themes.'),
  darkMode: z.boolean().optional().describe("Use dark mode variant of the theme (default: true)"),
  padding: z
    .union([z.literal(16), z.literal(32), z.literal(64), z.literal(128)])
    .optional()
    .describe("Padding around the code frame in pixels (default: 64)"),
  background: z.boolean().optional().describe("Show theme background gradient (default: true)"),
  lineNumbers: z.boolean().optional().describe("Show line numbers (default: false)"),
  fileName: z.string().optional().describe("Filename to display in the frame header"),
  highlightedLines: z.array(z.number()).optional().describe("Line numbers to highlight (1-indexed)"),
  exportSize: z
    .union([z.literal(2), z.literal(4), z.literal(6)])
    .optional()
    .describe("Export size / pixel ratio: 2 (1x), 4 (2x), or 6 (3x) (default: 2)"),
};

/**
 * Tool schema definition for MCP registration
 */
export const createCodeImageToolSchema = {
  name: "create_code_image",
  description: `Generate a beautiful code image/screenshot from a code snippet. Returns a base64-encoded PNG image. Supports syntax highlighting for 45+ programming languages and 20+ beautiful themes (Vercel, Supabase, Tailwind, OpenAI, etc.). Use list_themes to see available themes and list_languages for available languages.`,
};

/**
 * Handler function for the create_code_image tool.
 * This is called by the MCP server when the tool is invoked.
 */
export async function handleCreateCodeImage(params: CreateCodeImageInput): Promise<{
  content: Array<{ type: "text"; text: string } | { type: "image"; mimeType: string; data: string }>;
  isError?: boolean;
}> {
  const result = await createCodeImage(params);

  if (result.success) {
    return {
      content: [
        {
          type: "image",
          mimeType: result.mimeType,
          data: result.image,
        },
      ],
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: result.error,
              errorCode: result.errorCode,
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }
}
