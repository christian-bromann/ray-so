/**
 * Page Pool for Concurrent Rendering
 *
 * Manages a pool of browser pages to handle concurrent screenshot requests
 * efficiently. Pages are reused between renders to improve performance.
 */

import type { Page, BrowserContext } from "playwright-core";
import { getBrowser } from "./browser-manager.js";

/**
 * Configuration for page creation
 */
export interface PageConfig {
  /** Viewport width in pixels */
  width: number;
  /** Viewport height in pixels */
  height: number;
  /** Device scale factor (pixel ratio) */
  deviceScaleFactor: number;
}

/**
 * Default page configuration
 */
const DEFAULT_PAGE_CONFIG: PageConfig = {
  width: 800,
  height: 600,
  deviceScaleFactor: 2,
};

/**
 * Maximum number of concurrent pages in the pool
 */
const MAX_POOL_SIZE = 5;

/**
 * Pool of available pages ready for reuse
 */
const availablePages: Array<{ page: Page; context: BrowserContext }> = [];

/**
 * Set of pages currently in use
 */
const pagesInUse = new Set<Page>();

/**
 * Gets a page from the pool or creates a new one.
 * The page is configured with the specified viewport and device scale factor.
 *
 * @param config - Page configuration options
 * @returns Promise resolving to a configured page
 */
export async function getPage(config: Partial<PageConfig> = {}): Promise<Page> {
  const { width, height, deviceScaleFactor } = {
    ...DEFAULT_PAGE_CONFIG,
    ...config,
  };

  // Try to reuse an available page
  const available = availablePages.pop();
  if (available) {
    const { page, context } = available;

    // Update viewport and device scale factor if needed
    await page.setViewportSize({ width, height });

    pagesInUse.add(page);
    return page;
  }

  // Create a new page with the specified configuration
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor,
    // Disable unnecessary features for rendering
    bypassCSP: true,
    javaScriptEnabled: true,
    hasTouch: false,
    isMobile: false,
  });

  const page = await context.newPage();
  pagesInUse.add(page);

  return page;
}

/**
 * Releases a page back to the pool for reuse.
 * Cleans up the page state before making it available.
 *
 * @param page - The page to release
 */
export async function releasePage(page: Page): Promise<void> {
  if (!pagesInUse.has(page)) {
    return; // Page was not acquired from pool
  }

  pagesInUse.delete(page);

  // Check if page is still usable
  if (page.isClosed()) {
    return;
  }

  // Clean up page state
  try {
    // Clear content to free memory
    await page.setContent("<html></html>", { waitUntil: "domcontentloaded" });

    // Get the browser context for this page
    const context = page.context();

    // Add to pool if under max size, otherwise close
    if (availablePages.length < MAX_POOL_SIZE) {
      availablePages.push({ page, context });
    } else {
      await page.close();
      await context.close();
    }
  } catch (error) {
    // Page may have been closed externally, just log and continue
    console.error("Error releasing page:", error);
  }
}

/**
 * Closes all pages in the pool and clears resources.
 */
export async function closePagePool(): Promise<void> {
  // Close all in-use pages
  const inUseArray = Array.from(pagesInUse);
  for (const page of inUseArray) {
    try {
      const context = page.context();
      await page.close();
      await context.close();
    } catch {
      // Ignore errors during shutdown
    }
  }
  pagesInUse.clear();

  // Close all available pages
  while (availablePages.length > 0) {
    const { page, context } = availablePages.pop()!;
    try {
      await page.close();
      await context.close();
    } catch {
      // Ignore errors during shutdown
    }
  }
}

/**
 * Gets the current pool statistics.
 *
 * @returns Object with pool statistics
 */
export function getPoolStats(): {
  available: number;
  inUse: number;
  maxSize: number;
} {
  return {
    available: availablePages.length,
    inUse: pagesInUse.size,
    maxSize: MAX_POOL_SIZE,
  };
}
