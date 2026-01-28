/**
 * Language Auto-Detection
 *
 * Uses highlight.js for automatic language detection.
 * Falls back to plaintext if detection fails.
 */

import hljs from "highlight.js";
import { LANGUAGES, getAllLanguageIds } from "../shared/languages";

/**
 * Language detection result
 */
export interface DetectionResult {
  /**
   * Detected language ID (key in LANGUAGES)
   */
  languageId: string;

  /**
   * Display name of the detected language
   */
  languageName: string;

  /**
   * Confidence score (0-1), higher is more confident
   */
  confidence: number;

  /**
   * Whether the detection was successful
   */
  detected: boolean;
}

/**
 * Maps highlight.js language names to LANGUAGES keys.
 * Some languages have different names in highlight.js.
 */
const HLJS_TO_LANGUAGE_MAP: Record<string, string> = {
  bash: "shell",
  sh: "shell",
  zsh: "shell",
  shellsession: "console",
  plaintext: "plaintext",
  text: "plaintext",
  txt: "plaintext",
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  "c++": "cpp",
  "c#": "csharp",
  cs: "csharp",
  objc: "objectivec",
  "objective-c": "objectivec",
  yml: "yaml",
  md: "markdown",
  tex: "latex",
  kt: "kotlin",
  proto: "plaintext", // protobuf fallback
  erl: "erlang",
  ex: "elixir",
  exs: "elixir",
  hs: "haskell",
  ml: "ocaml",
  fs: "plaintext", // F# fallback
  jl: "julia",
  r: "r",
  tf: "hcl",
  docker: "dockerfile",
  graphql: "graphql",
  gql: "graphql",
  psql: "sql",
  mysql: "sql",
  pgsql: "sql",
};

/**
 * Detects the programming language of a code snippet.
 *
 * @param code - The code to analyze
 * @returns Detection result with language ID and confidence
 */
export function detectLanguage(code: string): DetectionResult {
  // Handle empty or whitespace-only code
  if (!code || !code.trim()) {
    return {
      languageId: "plaintext",
      languageName: "Plaintext",
      confidence: 1,
      detected: false,
    };
  }

  try {
    // Get list of languages to consider
    const languageIds = getAllLanguageIds();

    // Use highlight.js autodetection
    const result = hljs.highlightAuto(code, languageIds);

    if (result.language) {
      // Map hljs language name to our language ID
      const mappedLanguage = mapHljsLanguage(result.language);

      // Validate that the language exists in our LANGUAGES
      if (mappedLanguage && mappedLanguage in LANGUAGES) {
        // Calculate confidence (relevance is a relative score)
        // Higher relevance = better match, typical range is 0-20+
        const confidence = Math.min(result.relevance / 20, 1);

        return {
          languageId: mappedLanguage,
          languageName: LANGUAGES[mappedLanguage].name,
          confidence,
          detected: true,
        };
      }
    }

    // Fallback to plaintext
    return {
      languageId: "plaintext",
      languageName: "Plaintext",
      confidence: 0,
      detected: false,
    };
  } catch (error) {
    console.warn("Language detection failed:", error);
    return {
      languageId: "plaintext",
      languageName: "Plaintext",
      confidence: 0,
      detected: false,
    };
  }
}

/**
 * Maps highlight.js language name to our LANGUAGES key.
 */
function mapHljsLanguage(hljsLang: string): string {
  const normalized = hljsLang.toLowerCase();

  // Check direct mapping
  if (HLJS_TO_LANGUAGE_MAP[normalized]) {
    return HLJS_TO_LANGUAGE_MAP[normalized];
  }

  // Check if it exists directly in our languages
  if (normalized in LANGUAGES) {
    return normalized;
  }

  // Return the original if no mapping found (might still work)
  return normalized;
}

/**
 * Validates that a language ID is supported.
 */
export function isValidLanguageId(languageId: string): boolean {
  return languageId in LANGUAGES;
}

/**
 * Gets the best language match for a given language ID or name.
 *
 * @param input - Language ID, name, or file extension
 * @returns Matched language ID or "plaintext" if not found
 */
export function resolveLanguage(input: string): string {
  if (!input) return "plaintext";

  const normalized = input.toLowerCase().trim();

  // Direct match
  if (normalized in LANGUAGES) {
    return normalized;
  }

  // Check mapping
  if (HLJS_TO_LANGUAGE_MAP[normalized]) {
    return HLJS_TO_LANGUAGE_MAP[normalized];
  }

  // Try to match by name
  for (const [id, lang] of Object.entries(LANGUAGES)) {
    if (lang.name.toLowerCase() === normalized) {
      return id;
    }
  }

  // Try file extension mapping
  const extensionMap: Record<string, string> = {
    ".js": "javascript",
    ".jsx": "jsx",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".py": "python",
    ".rb": "ruby",
    ".rs": "rust",
    ".go": "go",
    ".java": "java",
    ".kt": "kotlin",
    ".swift": "swift",
    ".cs": "csharp",
    ".cpp": "cpp",
    ".c": "cpp",
    ".h": "cpp",
    ".php": "php",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".xml": "xml",
    ".md": "markdown",
    ".sql": "sql",
    ".sh": "shell",
    ".bash": "shell",
    ".zsh": "shell",
    ".dockerfile": "dockerfile",
    ".prisma": "prisma",
    ".graphql": "graphql",
    ".gql": "graphql",
    ".vue": "vue",
    ".svelte": "svelte",
    ".astro": "astro",
    ".toml": "toml",
    ".zig": "zig",
    ".ex": "elixir",
    ".exs": "elixir",
    ".erl": "erlang",
    ".hs": "haskell",
    ".ml": "ocaml",
    ".elm": "elm",
    ".clj": "clojure",
    ".scala": "scala",
    ".r": "r",
    ".jl": "julia",
    ".lua": "lua",
    ".dart": "dart",
    ".v": "v",
    ".sol": "solidity",
    ".tf": "hcl",
    ".ps1": "powershell",
    ".m": "objectivec",
    ".gleam": "gleam",
    ".move": "move",
    ".liquid": "liquid",
  };

  // Check if input looks like a file extension
  const ext = normalized.startsWith(".") ? normalized : `.${normalized}`;
  if (extensionMap[ext]) {
    return extensionMap[ext];
  }

  return "plaintext";
}

/**
 * Gets the language for a given filename.
 *
 * @param filename - The filename (e.g., "index.ts")
 * @returns Language ID
 */
export function getLanguageFromFilename(filename: string): string {
  if (!filename) return "plaintext";

  // Extract extension
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "plaintext";

  const extension = filename.slice(lastDot).toLowerCase();
  return resolveLanguage(extension);
}
