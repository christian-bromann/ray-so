/**
 * Browser Manager for Playwright
 *
 * Implements singleton browser instance management for efficient
 * server-side rendering of code images.
 *
 * Supports both local development (regular Playwright) and
 * Vercel serverless (@sparticuz/chromium).
 */

import { chromium, type Browser } from "playwright-core";

// Singleton browser instance
let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

/**
 * Detect if running in Vercel/AWS Lambda serverless environment
 */
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/**
 * Default browser launch options optimized for headless rendering (local dev)
 */
const LOCAL_BROWSER_OPTIONS = {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--no-first-run",
    "--disable-background-networking",
    "--disable-default-apps",
    "--disable-extensions",
    "--disable-sync",
    "--disable-translate",
    "--mute-audio",
    "--hide-scrollbars",
  ],
};

/**
 * Gets the singleton browser instance, launching it if necessary.
 * Uses lazy initialization to defer browser startup until first use.
 *
 * @returns Promise resolving to the browser instance
 */
export async function getBrowser(): Promise<Browser> {
  // If browser is running and connected, return it
  if (browserInstance?.isConnected()) {
    return browserInstance;
  }

  // If a launch is already in progress, wait for it
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  // Launch a new browser
  browserLaunchPromise = launchBrowser();

  try {
    browserInstance = await browserLaunchPromise;
    return browserInstance;
  } finally {
    browserLaunchPromise = null;
  }
}

/**
 * Launches a new browser instance with crash recovery handling.
 * Uses @sparticuz/chromium in serverless environments, regular Playwright locally.
 */
async function launchBrowser(): Promise<Browser> {
  let browser: Browser;

  if (isServerless) {
    // Use @sparticuz/chromium for Vercel/Lambda
    const chromiumBinary = await import("@sparticuz/chromium");
    browser = await chromium.launch({
      args: chromiumBinary.default.args,
      executablePath: await chromiumBinary.default.executablePath(),
      headless: true,
    });
  } else {
    // Local development - use regular Playwright with installed browser
    browser = await chromium.launch(LOCAL_BROWSER_OPTIONS);
  }

  // Handle browser disconnection (crash recovery)
  browser.on("disconnected", () => {
    if (browserInstance === browser) {
      browserInstance = null;
    }
  });

  return browser;
}

/**
 * Closes the browser instance and cleans up resources.
 * Safe to call multiple times.
 */
export async function closeBrowser(): Promise<void> {
  // Wait for any pending launch to complete first
  if (browserLaunchPromise) {
    try {
      await browserLaunchPromise;
    } catch {
      // Ignore launch errors during shutdown
    }
  }

  if (browserInstance) {
    const browser = browserInstance;
    browserInstance = null;

    try {
      await browser.close();
    } catch (error) {
      // Log but don't throw - browser may already be closed
      console.error("Error closing browser:", error);
    }
  }
}

/**
 * Checks if the browser is currently running and connected.
 *
 * @returns true if browser is running and connected
 */
export function isBrowserRunning(): boolean {
  return browserInstance?.isConnected() ?? false;
}

/**
 * Forces a restart of the browser instance.
 * Useful for recovering from corrupted state.
 */
export async function restartBrowser(): Promise<Browser> {
  await closeBrowser();
  return getBrowser();
}
