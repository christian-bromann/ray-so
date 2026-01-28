/**
 * Renderer Module
 *
 * Exports all renderer functionality for capturing code image screenshots.
 */

// Satori-based renderer (no browser required)
export { renderCodeImageWithSatori, SatoriRenderError, type SatoriRenderOptions } from "./satori-renderer";

// Syntax highlighting
export {
  getHighlighter,
  highlightCode,
  loadLanguage,
  disposeHighlighter,
  isHighlighterReady,
  type HighlightOptions,
} from "./highlighter";

// Language detection
export {
  detectLanguage,
  isValidLanguageId,
  resolveLanguage,
  getLanguageFromFilename,
  type DetectionResult,
} from "./language-detection";
