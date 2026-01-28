/**
 * Renderer Module
 *
 * Exports all renderer functionality for capturing code image screenshots.
 */

// Browser management
export { getBrowser, closeBrowser, isBrowserRunning, restartBrowser } from "./browser-manager.js";

// Page pool
export { getPage, releasePage, closePagePool, getPoolStats, type PageConfig } from "./page-pool.js";

// Screenshot capture
export {
  captureScreenshot,
  captureScreenshotFullContent,
  ScreenshotError,
  type ScreenshotOptions,
} from "./screenshot.js";

// Syntax highlighting
export {
  getHighlighter,
  highlightCode,
  loadLanguage,
  disposeHighlighter,
  isHighlighterReady,
  type HighlightOptions,
} from "./highlighter.js";

// HTML template generation
export { generateHtmlTemplate, cssPropsToInlineStyle, type HtmlTemplateOptions } from "./html-template.js";

// Code rendering
export {
  renderHighlightedCode,
  renderPlaintext,
  escapeHtml,
  isValidLanguage,
  getLanguageDisplayName,
  type CodeRenderOptions,
} from "./code-renderer.js";

// Frame rendering
export { generateCodeFrameHtml, type CodeFrameOptions } from "./frame-renderer.js";

// Language detection
export {
  detectLanguage,
  isValidLanguageId,
  resolveLanguage,
  getLanguageFromFilename,
  type DetectionResult,
} from "./language-detection.js";
