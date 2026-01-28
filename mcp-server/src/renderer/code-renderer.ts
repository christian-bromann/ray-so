/**
 * Highlighted Code Renderer
 *
 * Ports the HighlightedCode component logic to server-side HTML generation.
 * Handles syntax highlighting, line numbers, and highlighted lines.
 */

import { getHighlighter, highlightCode } from "./highlighter";
import { LANGUAGES } from "../shared/languages";

/**
 * Options for rendering highlighted code
 */
export interface CodeRenderOptions {
  /**
   * The code to render
   */
  code: string;

  /**
   * Language ID for syntax highlighting
   */
  language: string;

  /**
   * Lines to highlight (1-indexed)
   */
  highlightedLines?: number[];

  /**
   * Whether to show line numbers
   */
  lineNumbers?: boolean;

  /**
   * Theme name for Shiki (e.g., 'css-variables', 'tailwind-dark')
   */
  themeName?: string;
}

/**
 * Renders code with syntax highlighting.
 *
 * @param options - Rendering options
 * @returns HTML string with highlighted code wrapped in editor structure
 */
export async function renderHighlightedCode(options: CodeRenderOptions): Promise<string> {
  const { code, language, highlightedLines = [], lineNumbers = false, themeName = "css-variables" } = options;

  // Get the highlighter
  const highlighter = await getHighlighter();

  // Determine if this is plaintext
  const isPlaintext = language === "plaintext" || !language;

  // Generate highlighted HTML
  const highlightedHtml = await highlightCode(highlighter, code, language, {
    highlightedLines,
    themeName,
  });

  // Build CSS classes
  const classes = buildEditorClasses(isPlaintext, lineNumbers, code);

  // Wrap in editor structure
  return `<div class="${classes}">
  <div class="formatted${isPlaintext ? " plainText" : ""}">
    ${highlightedHtml}
  </div>
</div>`;
}

/**
 * Builds the CSS classes for the editor container.
 */
function buildEditorClasses(isPlaintext: boolean, lineNumbers: boolean, code: string): string {
  const classes = ["editor"];

  if (lineNumbers && !isPlaintext) {
    classes.push("showLineNumbers");

    // Add large line numbers class if code has many lines
    const numberOfLines = (code.match(/\n/g) || []).length + 1;
    if (numberOfLines > 8) {
      classes.push("showLineNumbersLarge");
    }
  }

  return classes.join(" ");
}

/**
 * Escapes HTML special characters for safe display.
 */
export function escapeHtml(text: string): string {
  return text.replace(/[\u00A0-\u9999<>&]/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Renders plaintext without syntax highlighting.
 */
export function renderPlaintext(code: string, highlightedLines: number[] = []): string {
  const escapedCode = escapeHtml(code);
  const lines = escapedCode.split("\n");

  const lineElements = lines
    .map((line, index) => {
      const lineNum = index + 1;
      const isHighlighted = highlightedLines.includes(lineNum);
      const classes = isHighlighted ? "line highlighted-line" : "line";
      // Use non-breaking space for empty lines to maintain height
      const content = line || " ";
      return `<span class="${classes}" data-line="${lineNum}">${content}</span>`;
    })
    .join("\n");

  return `<pre class="shiki" style="background-color: transparent;"><code>${lineElements}</code></pre>`;
}

/**
 * Validates that a language ID is supported.
 */
export function isValidLanguage(languageId: string): boolean {
  return languageId in LANGUAGES;
}

/**
 * Gets the display name for a language ID.
 */
export function getLanguageDisplayName(languageId: string): string {
  const language = LANGUAGES[languageId];
  return language ? language.name : languageId;
}
