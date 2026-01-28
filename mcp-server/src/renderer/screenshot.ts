/**
 * Screenshot Capture Utility
 *
 * Captures screenshots of HTML content using Playwright.
 * Supports configurable pixel ratios and viewport dimensions.
 */

import { getPage, releasePage } from "./page-pool.js";
import { getBrowser } from "./browser-manager.js";

/**
 * Options for screenshot capture
 */
export interface ScreenshotOptions {
  /**
   * Pixel ratio for the screenshot (device scale factor)
   * Supported values: 2 (default), 4, or 6
   */
  pixelRatio?: 2 | 4 | 6;

  /**
   * Viewport dimensions for rendering
   */
  viewport?: {
    width: number;
    height: number;
  };

  /**
   * Timeout in milliseconds for the screenshot operation
   * Default: 30000 (30 seconds)
   */
  timeout?: number;
}

/**
 * Default screenshot options
 */
const DEFAULT_OPTIONS: Required<ScreenshotOptions> = {
  pixelRatio: 2,
  viewport: { width: 800, height: 600 },
  timeout: 30000,
};

/**
 * Custom error class for screenshot-related errors
 */
export class ScreenshotError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ScreenshotError";
  }
}

/**
 * Captures a screenshot of the provided HTML content.
 *
 * @param html - The HTML content to render
 * @param options - Screenshot configuration options
 * @returns Promise resolving to a PNG buffer
 * @throws ScreenshotError if capture fails or times out
 */
export async function captureScreenshot(html: string, options: ScreenshotOptions = {}): Promise<Buffer> {
  const { pixelRatio, viewport, timeout } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new ScreenshotError(`Screenshot capture timed out after ${timeout}ms`, "TIMEOUT"));
    }, timeout);
  });

  // Race between capture and timeout
  return Promise.race([performCapture(html, pixelRatio, viewport), timeoutPromise]);
}

/**
 * Performs the actual screenshot capture
 */
async function performCapture(
  html: string,
  pixelRatio: number,
  viewport: { width: number; height: number },
): Promise<Buffer> {
  // Get a fresh page with the correct device scale factor for this render
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: pixelRatio,
    bypassCSP: true,
    javaScriptEnabled: true,
  });

  const page = await context.newPage();

  try {
    // Set the HTML content
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 10000,
    });

    // Wait a brief moment for any CSS transitions/animations to settle
    await page.waitForTimeout(100);

    // Capture the screenshot
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
      omitBackground: false,
    });

    return Buffer.from(screenshot);
  } catch (error) {
    // Handle specific Playwright errors
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        throw new ScreenshotError("Page load timed out", "PAGE_TIMEOUT", error);
      }
      if (error.message.includes("crashed")) {
        throw new ScreenshotError("Browser page crashed during render", "PAGE_CRASH", error);
      }
    }

    throw new ScreenshotError(
      `Failed to capture screenshot: ${error instanceof Error ? error.message : String(error)}`,
      "CAPTURE_FAILED",
      error,
    );
  } finally {
    // Always clean up - close page and context
    try {
      await page.close();
      await context.close();
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Captures a screenshot with automatic content-based dimensions.
 * The viewport will be sized to fit the content.
 *
 * @param html - The HTML content to render
 * @param options - Screenshot configuration options
 * @returns Promise resolving to a PNG buffer
 */
export async function captureScreenshotFullContent(
  html: string,
  options: Omit<ScreenshotOptions, "viewport"> & {
    maxWidth?: number;
    maxHeight?: number;
  } = {},
): Promise<Buffer> {
  const { pixelRatio = 2, timeout = 30000, maxWidth = 2000, maxHeight = 5000 } = options;

  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: maxWidth, height: maxHeight },
    deviceScaleFactor: pixelRatio,
    bypassCSP: true,
    javaScriptEnabled: true,
  });

  const page = await context.newPage();

  try {
    // Set the HTML content
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 10000,
    });

    // Get the actual content dimensions
    const dimensions = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;

      const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);

      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      );

      return { width, height };
    });

    // Resize viewport to match content
    await page.setViewportSize({
      width: Math.min(dimensions.width, maxWidth),
      height: Math.min(dimensions.height, maxHeight),
    });

    // Wait for any reflow
    await page.waitForTimeout(50);

    // Capture the screenshot
    const screenshot = await page.screenshot({
      type: "png",
      fullPage: true,
      omitBackground: false,
    });

    return Buffer.from(screenshot);
  } finally {
    try {
      await page.close();
      await context.close();
    } catch {
      // Ignore cleanup errors
    }
  }
}
