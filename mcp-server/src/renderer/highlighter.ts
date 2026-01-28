/**
 * Shiki Highlighter Wrapper
 *
 * Provides syntax highlighting for code using Shiki with CSS variables theme.
 * Implements lazy loading of language grammars and caching of highlighter instance.
 */

import { createHighlighter, type Highlighter, type BundledLanguage } from "shiki";
import { createRayShikiTheme } from "../shared/theme-css.js";
import { LANGUAGES } from "../shared/languages.js";

// Cached highlighter instance
let highlighterInstance: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

// Pre-loaded common languages for better performance
const COMMON_LANGUAGES: BundledLanguage[] = ["javascript", "typescript", "tsx", "python", "json"];

// Set of loaded language names
const loadedLanguages = new Set<string>();

/**
 * Gets or creates the Shiki highlighter instance.
 * Uses lazy initialization and caches the instance for reuse.
 */
export async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) {
    return highlighterInstance;
  }

  if (highlighterPromise) {
    return highlighterPromise;
  }

  highlighterPromise = initializeHighlighter();
  highlighterInstance = await highlighterPromise;
  return highlighterInstance;
}

/**
 * Creates custom Tailwind themes for Shiki
 */
function createTailwindThemes() {
  // Tailwind uses specific themes not CSS variables
  // These are simplified versions - the actual highlighting comes from the bundled themes
  return {
    tailwindDark: {
      name: "tailwind-dark",
      type: "dark" as const,
      colors: {
        "editor.foreground": "#fff",
        "editor.background": "transparent",
      },
      tokenColors: [
        { scope: ["comment"], settings: { foreground: "#64748b" } },
        { scope: ["string"], settings: { foreground: "#a5f3fc" } },
        { scope: ["keyword"], settings: { foreground: "#c4b5fd" } },
        { scope: ["variable"], settings: { foreground: "#fde68a" } },
        { scope: ["support.function", "entity.name.function"], settings: { foreground: "#67e8f9" } },
        { scope: ["constant"], settings: { foreground: "#fca5a5" } },
      ],
    },
    tailwindLight: {
      name: "tailwind-light",
      type: "light" as const,
      colors: {
        "editor.foreground": "#000",
        "editor.background": "transparent",
      },
      tokenColors: [
        { scope: ["comment"], settings: { foreground: "#64748b" } },
        { scope: ["string"], settings: { foreground: "#0891b2" } },
        { scope: ["keyword"], settings: { foreground: "#7c3aed" } },
        { scope: ["variable"], settings: { foreground: "#ca8a04" } },
        { scope: ["support.function", "entity.name.function"], settings: { foreground: "#0284c7" } },
        { scope: ["constant"], settings: { foreground: "#dc2626" } },
      ],
    },
  };
}

/**
 * Initializes the Shiki highlighter with CSS variables theme.
 */
async function initializeHighlighter(): Promise<Highlighter> {
  const cssVariablesTheme = createRayShikiTheme();
  const tailwindThemes = createTailwindThemes();

  const highlighter = await createHighlighter({
    themes: [
      cssVariablesTheme,
      tailwindThemes.tailwindDark,
      tailwindThemes.tailwindLight,
      "github-light",
      "github-dark",
    ],
    langs: COMMON_LANGUAGES,
  });

  // Track pre-loaded languages
  COMMON_LANGUAGES.forEach((lang) => loadedLanguages.add(lang));

  return highlighter;
}

/**
 * Loads a language grammar into the highlighter if not already loaded.
 */
export async function loadLanguage(highlighter: Highlighter, languageId: string): Promise<void> {
  const normalizedLang = normalizeLanguageId(languageId);

  if (loadedLanguages.has(normalizedLang)) {
    return;
  }

  const language = LANGUAGES[languageId];
  if (language && language.src) {
    try {
      const langModule = await language.src();
      await highlighter.loadLanguage(langModule.default || langModule);
      loadedLanguages.add(normalizedLang);
    } catch (error) {
      console.warn(`Failed to load language grammar for ${languageId}:`, error);
      // Fall back to plaintext
    }
  }
}

/**
 * Normalizes language ID for Shiki compatibility.
 */
function normalizeLanguageId(languageId: string): string {
  // Handle special cases
  const languageMap: Record<string, string> = {
    typescript: "tsx",
    shell: "bash",
    console: "shellscript",
  };

  return languageMap[languageId] || languageId.toLowerCase();
}

/**
 * Gets the Shiki-compatible language name.
 */
function getShikiLanguage(languageId: string): string {
  // Special mappings for Shiki compatibility
  const shikiMap: Record<string, string> = {
    typescript: "tsx",
    shell: "bash",
    console: "shellscript",
    plaintext: "text",
  };

  return shikiMap[languageId] || languageId.toLowerCase();
}

/**
 * Options for code highlighting
 */
export interface HighlightOptions {
  /**
   * Lines to highlight (1-indexed)
   */
  highlightedLines?: number[];

  /**
   * Theme name to use
   */
  themeName?: string;
}

/**
 * Highlights code using Shiki with CSS variables theme.
 *
 * @param highlighter - The Shiki highlighter instance
 * @param code - The code to highlight
 * @param languageId - The language ID (from LANGUAGES)
 * @param options - Additional highlighting options
 * @returns HTML string with highlighted code
 */
export async function highlightCode(
  highlighter: Highlighter,
  code: string,
  languageId: string,
  options: HighlightOptions = {},
): Promise<string> {
  const { highlightedLines = [], themeName = "css-variables" } = options;

  // Handle plaintext - just escape and wrap
  if (languageId === "plaintext" || !languageId) {
    return wrapPlaintext(code, highlightedLines);
  }

  // Load language if needed
  await loadLanguage(highlighter, languageId);

  const shikiLang = getShikiLanguage(languageId);

  try {
    const html = highlighter.codeToHtml(code, {
      lang: shikiLang,
      theme: themeName,
      transformers: [
        {
          line(node, line) {
            // Add data-line attribute for line numbers
            node.properties["data-line"] = line;

            // Add highlighted-line class if line is in highlightedLines
            if (highlightedLines.includes(line)) {
              const existingClass = node.properties.class || "";
              node.properties.class = `${existingClass} highlighted-line`.trim();
            }
          },
        },
      ],
    });

    return html;
  } catch (error) {
    console.warn(`Failed to highlight code as ${languageId}:`, error);
    // Fall back to plaintext
    return wrapPlaintext(code, highlightedLines);
  }
}

/**
 * Wraps plaintext code in proper HTML structure.
 */
function wrapPlaintext(code: string, highlightedLines: number[] = []): string {
  const escapedCode = escapeHtml(code);
  const lines = escapedCode.split("\n");

  const lineElements = lines
    .map((line, index) => {
      const lineNum = index + 1;
      const isHighlighted = highlightedLines.includes(lineNum);
      const classes = isHighlighted ? "line highlighted-line" : "line";
      return `<span class="${classes}" data-line="${lineNum}">${line || " "}</span>`;
    })
    .join("\n");

  return `<pre class="shiki" style="background-color: transparent;"><code>${lineElements}</code></pre>`;
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(text: string): string {
  return text.replace(/[\u00A0-\u9999<>&]/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Disposes of the highlighter instance.
 * Call this when shutting down to free resources.
 */
export function disposeHighlighter(): void {
  if (highlighterInstance) {
    highlighterInstance.dispose();
    highlighterInstance = null;
    highlighterPromise = null;
    loadedLanguages.clear();
  }
}

/**
 * Checks if the highlighter is initialized.
 */
export function isHighlighterReady(): boolean {
  return highlighterInstance !== null;
}
