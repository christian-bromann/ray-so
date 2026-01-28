/**
 * Performance Tests for MCP Code Image Server
 *
 * Tests that verify performance requirements:
 * - Simple code image generates in under 5 seconds
 * - Server startup is under 2 seconds
 * - 500-line code snippet renders successfully
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createCodeImage } from "../tools/create-code-image";
import { getBrowser, closeBrowser } from "../renderer/browser-manager";
import { getHighlighter, disposeHighlighter } from "../renderer/highlighter";
import { closePagePool } from "../renderer/page-pool";

describe("Performance Tests", () => {
  afterAll(async () => {
    disposeHighlighter();
    await closePagePool();
    await closeBrowser();
  });

  describe("Server Startup", () => {
    it("should start browser and highlighter in under 2 seconds", async () => {
      const startTime = Date.now();

      // Initialize browser and highlighter (simulates server startup)
      await Promise.all([getBrowser(), getHighlighter()]);

      const elapsed = Date.now() - startTime;

      // Allow up to 2 seconds for startup (may be slower in CI)
      expect(elapsed).toBeLessThan(2000);
    });
  });

  describe("Image Generation Performance", () => {
    it("should generate simple code image in under 5 seconds", async () => {
      const simpleCode = `function hello() {
  console.log("Hello, world!");
  return 42;
}`;

      const startTime = Date.now();

      const result = await createCodeImage({
        code: simpleCode,
        language: "javascript",
        theme: "vercel",
        darkMode: true,
        padding: 64,
        background: true,
      });

      const elapsed = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(5000);
    });

    it("should render 500-line code snippet successfully", async () => {
      // Generate a 500-line code snippet
      const lines: string[] = [];
      lines.push("// Auto-generated 500-line code snippet for performance testing");
      lines.push("class LargeCodeExample {");

      for (let i = 0; i < 495; i++) {
        if (i % 10 === 0) {
          lines.push(`  // Section ${Math.floor(i / 10) + 1}`);
          lines.push(`  public method${i}(): void {`);
        } else if (i % 10 === 9) {
          lines.push(`    console.log("Method ${i} complete");`);
          lines.push("  }");
        } else {
          lines.push(`    const value${i} = ${i} * 2;`);
        }
      }

      lines.push("}");
      lines.push("export default LargeCodeExample;");

      const largeCode = lines.slice(0, 500).join("\n");

      const result = await createCodeImage({
        code: largeCode,
        language: "typescript",
        theme: "vercel",
        darkMode: true,
        padding: 32,
        lineNumbers: true,
        background: true,
      });

      // Should succeed within the 30-second timeout
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.image).toBeTruthy();
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      }
    }, 30000); // 30 second timeout for large snippet
  });
});
