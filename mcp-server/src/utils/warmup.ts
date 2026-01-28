/**
 * Server Warmup Module
 *
 * Pre-initializes expensive resources (browser, highlighter) on server start
 * to ensure fast response times for the first request.
 */

import { getBrowser } from "../renderer/browser-manager.js";
import { getHighlighter } from "../renderer/highlighter.js";
import { getPage, releasePage } from "../renderer/page-pool.js";
import { logger } from "./logger.js";

/**
 * Warmup status
 */
export interface WarmupStatus {
  browser: boolean;
  highlighter: boolean;
  pagePool: boolean;
  warmupRender: boolean;
  totalDuration: number;
}

/**
 * Pre-warms all server resources.
 *
 * This should be called on server startup to ensure:
 * - Browser is launched and ready
 * - Shiki highlighter is initialized with common languages
 * - Page pool has at least one page ready
 * - A test render is performed to warm up the rendering pipeline
 */
export async function warmupServer(): Promise<WarmupStatus> {
  const done = logger.time("Server warmup complete");

  const status: WarmupStatus = {
    browser: false,
    highlighter: false,
    pagePool: false,
    warmupRender: false,
    totalDuration: 0,
  };

  const startTime = Date.now();

  try {
    // Warm up browser and highlighter in parallel
    const [browser, highlighter] = await Promise.all([warmupBrowser(), warmupHighlighter()]);

    status.browser = browser;
    status.highlighter = highlighter;

    // Warm up page pool (requires browser to be ready)
    status.pagePool = await warmupPagePool();

    // Perform a warmup render to ensure the full pipeline is ready
    status.warmupRender = await warmupRender();

    status.totalDuration = Date.now() - startTime;
    done({ status: "success", ...status });

    return status;
  } catch (error) {
    status.totalDuration = Date.now() - startTime;
    logger.error("Server warmup failed", error as Error, { status });
    return status;
  }
}

/**
 * Pre-launches the browser instance
 */
async function warmupBrowser(): Promise<boolean> {
  const done = logger.time("Browser warmup");
  try {
    await getBrowser();
    done();
    return true;
  } catch (error) {
    logger.error("Browser warmup failed", error as Error);
    return false;
  }
}

/**
 * Pre-initializes the Shiki highlighter with common languages
 */
async function warmupHighlighter(): Promise<boolean> {
  const done = logger.time("Highlighter warmup");
  try {
    await getHighlighter();
    done();
    return true;
  } catch (error) {
    logger.error("Highlighter warmup failed", error as Error);
    return false;
  }
}

/**
 * Pre-creates a page in the pool
 */
async function warmupPagePool(): Promise<boolean> {
  const done = logger.time("Page pool warmup");
  try {
    const page = await getPage({
      width: 800,
      height: 600,
      deviceScaleFactor: 2,
    });

    // Release the page back to pool for reuse
    await releasePage(page);
    done();
    return true;
  } catch (error) {
    logger.error("Page pool warmup failed", error as Error);
    return false;
  }
}

/**
 * Performs a minimal render to warm up the full pipeline
 */
async function warmupRender(): Promise<boolean> {
  const done = logger.time("Warmup render");
  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      viewport: { width: 400, height: 300 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // Render a minimal HTML page
    await page.setContent(
      `<!DOCTYPE html>
      <html>
        <head><style>body { margin: 0; padding: 20px; font-family: monospace; }</style></head>
        <body><pre>// Warmup</pre></body>
      </html>`,
      { waitUntil: "domcontentloaded" },
    );

    // Take a tiny screenshot to warm up the screenshot pipeline
    await page.screenshot({ type: "png", fullPage: false });

    // Clean up
    await page.close();
    await context.close();

    done();
    return true;
  } catch (error) {
    logger.error("Warmup render failed", error as Error);
    return false;
  }
}

/**
 * Checks if warmup has been performed
 */
let warmupPerformed = false;

export function isWarmupComplete(): boolean {
  return warmupPerformed;
}

/**
 * Marks warmup as complete
 */
export function markWarmupComplete(): void {
  warmupPerformed = true;
}

/**
 * Resets warmup state (for testing)
 */
export function resetWarmupState(): void {
  warmupPerformed = false;
}
