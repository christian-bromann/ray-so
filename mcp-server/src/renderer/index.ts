/**
 * Renderer Module
 *
 * Exports all renderer functionality for capturing code image screenshots.
 */

// Browser management
export { getBrowser, closeBrowser, isBrowserRunning, restartBrowser } from "./browser-manager";

// Page pool
export { getPage, releasePage, closePagePool, getPoolStats, type PageConfig } from "./page-pool";

// Screenshot capture
export { captureScreenshot, captureScreenshotFullContent, ScreenshotError, type ScreenshotOptions } from "./screenshot";

// Syntax highlighting
export {
  getHighlighter,
  highlightCode,
  loadLanguage,
  disposeHighlighter,
  isHighlighterReady,
  type HighlightOptions,
} from "./highlighter";

// HTML template generation
export { generateHtmlTemplate, cssPropsToInlineStyle, type HtmlTemplateOptions } from "./html-template";

// Code rendering
export {
  renderHighlightedCode,
  renderPlaintext,
  escapeHtml,
  isValidLanguage,
  getLanguageDisplayName,
  type CodeRenderOptions,
} from "./code-renderer";

// Frame rendering
export { generateCodeFrameHtml, type CodeFrameOptions } from "./frame-renderer";

// Language detection
export {
  detectLanguage,
  isValidLanguageId,
  resolveLanguage,
  getLanguageFromFilename,
  type DetectionResult,
} from "./language-detection";
