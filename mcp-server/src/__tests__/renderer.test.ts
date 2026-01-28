import { describe, it, expect, afterAll, afterEach } from "vitest";
import { getBrowser, closeBrowser, isBrowserRunning } from "../renderer/browser-manager";
import { closePagePool } from "../renderer/page-pool";
import { captureScreenshot, type ScreenshotOptions } from "../renderer/screenshot";

describe("Playwright Renderer", () => {
  afterAll(async () => {
    // Clean up all resources after all tests complete
    await closePagePool();
    await closeBrowser();
  });

  describe("Browser Manager", () => {
    afterEach(async () => {
      // Ensure browser is closed after each browser manager test for isolation
      await closeBrowser();
    });

    it("should launch browser and create page successfully", async () => {
      // Test browser launch with lazy initialization
      const browser = await getBrowser();

      expect(browser).toBeDefined();
      expect(browser.isConnected()).toBe(true);
      expect(isBrowserRunning()).toBe(true);

      // Verify we can create a context and page
      const context = await browser.newContext();
      const page = await context.newPage();

      expect(page).toBeDefined();
      expect(page.isClosed()).toBe(false);

      await page.close();
      await context.close();
    });

    it("should handle graceful shutdown and resource cleanup", async () => {
      // Ensure browser is running first
      await getBrowser();
      expect(isBrowserRunning()).toBe(true);

      // Close the browser
      await closeBrowser();
      expect(isBrowserRunning()).toBe(false);

      // Calling close again should not throw
      await expect(closeBrowser()).resolves.not.toThrow();

      // Browser should be able to restart after close
      const browser = await getBrowser();
      expect(browser.isConnected()).toBe(true);
      expect(isBrowserRunning()).toBe(true);
    });
  });

  describe("Screenshot Capture", () => {
    it("should render basic HTML to image", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                margin: 0; 
                padding: 20px;
                background: #1a1a2e;
                font-family: monospace;
              }
              .code {
                color: #e94560;
                font-size: 16px;
              }
            </style>
          </head>
          <body>
            <div class="code">console.log("Hello, World!");</div>
          </body>
        </html>
      `;

      const options: ScreenshotOptions = {
        pixelRatio: 2,
        viewport: { width: 400, height: 200 },
      };

      const result = await captureScreenshot(html, options);

      // Verify we get a valid PNG buffer
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Check PNG magic bytes
      const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      expect(result.subarray(0, 4).equals(pngMagicBytes)).toBe(true);
    });

    it("should render with custom viewport dimensions", async () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                margin: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .box {
                width: 200px;
                height: 100px;
                background: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: sans-serif;
              }
            </style>
          </head>
          <body>
            <div class="box">Custom Viewport</div>
          </body>
        </html>
      `;

      // Test with 4x pixel ratio and custom dimensions
      const options: ScreenshotOptions = {
        pixelRatio: 4,
        viewport: { width: 800, height: 600 },
      };

      const result = await captureScreenshot(html, options);

      // Verify we get a valid PNG buffer
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);

      // Check PNG magic bytes
      const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      expect(result.subarray(0, 4).equals(pngMagicBytes)).toBe(true);

      // The image should be larger due to 4x pixel ratio (compared to 2x)
      // We can't easily verify exact dimensions without image parsing,
      // but we can verify the file is reasonably sized for 4x ratio
      expect(result.length).toBeGreaterThan(1000);
    });
  });
});
