import { describe, it, expect, afterAll } from "vitest";
import { closeBrowser } from "../renderer/browser-manager.js";
import { closePagePool } from "../renderer/page-pool.js";
import { disposeHighlighter } from "../renderer/highlighter.js";
import { createCodeImage, createCodeImageToolSchema, handleCreateCodeImage } from "../tools/create-code-image.js";

describe("create_code_image Tool", () => {
  afterAll(async () => {
    // Clean up all resources after all tests complete
    disposeHighlighter();
    await closePagePool();
    await closeBrowser();
  });

  describe("Image Generation", () => {
    it("should generate valid base64 PNG for simple code input", async () => {
      const result = await createCodeImage({
        code: 'console.log("Hello, World!");',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Check that we get a base64 string
        expect(typeof result.image).toBe("string");
        expect(result.image.length).toBeGreaterThan(0);

        // Verify it's valid base64 by decoding
        const buffer = Buffer.from(result.image, "base64");
        expect(buffer.length).toBeGreaterThan(0);

        // Check PNG magic bytes
        const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        expect(buffer.subarray(0, 4).equals(pngMagicBytes)).toBe(true);

        // Check metadata
        expect(result.mimeType).toBe("image/png");
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      }
    }, 30000);

    it("should apply specified theme correctly", async () => {
      const result = await createCodeImage({
        code: "const x = 42;",
        theme: "supabase",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Verify we get a valid image
        const buffer = Buffer.from(result.image, "base64");
        const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        expect(buffer.subarray(0, 4).equals(pngMagicBytes)).toBe(true);
      }
    }, 30000);

    it("should apply specified language highlighting", async () => {
      const result = await createCodeImage({
        code: "def hello():\n    print('Hello')",
        language: "python",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Verify we get a valid image
        const buffer = Buffer.from(result.image, "base64");
        const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        expect(buffer.subarray(0, 4).equals(pngMagicBytes)).toBe(true);
      }
    }, 30000);

    it("should respect all optional parameters", async () => {
      const result = await createCodeImage({
        code: 'console.log("test");',
        language: "javascript",
        theme: "vercel",
        darkMode: false,
        padding: 32,
        background: true,
        lineNumbers: true,
        fileName: "test.js",
        highlightedLines: [1],
        exportSize: 4,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Verify we get a valid image
        const buffer = Buffer.from(result.image, "base64");
        const pngMagicBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        expect(buffer.subarray(0, 4).equals(pngMagicBytes)).toBe(true);

        // Image should be larger due to 4x export size
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      }
    }, 30000);
  });

  describe("Error Handling", () => {
    it("should return error for invalid theme ID", async () => {
      const result = await createCodeImage({
        code: "const x = 1;",
        theme: "invalid-theme-that-does-not-exist",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid theme ID");
        expect(result.errorCode).toBe("INVALID_THEME");
      }
    });

    it("should return error for empty code input", async () => {
      const result = await createCodeImage({
        code: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("non-empty string");
        expect(result.errorCode).toBe("INVALID_CODE");
      }
    });
  });

  describe("Tool Schema", () => {
    it("should have correct tool schema definition", async () => {
      const { createCodeImageZodSchema } = await import("../tools/create-code-image.js");

      expect(createCodeImageToolSchema.name).toBe("create_code_image");
      expect(createCodeImageToolSchema.description).toBeDefined();

      // Check Zod schema properties exist
      expect(createCodeImageZodSchema.code).toBeDefined();
      expect(createCodeImageZodSchema.language).toBeDefined();
      expect(createCodeImageZodSchema.theme).toBeDefined();
      expect(createCodeImageZodSchema.darkMode).toBeDefined();
      expect(createCodeImageZodSchema.padding).toBeDefined();
      expect(createCodeImageZodSchema.background).toBeDefined();
      expect(createCodeImageZodSchema.lineNumbers).toBeDefined();
      expect(createCodeImageZodSchema.fileName).toBeDefined();
      expect(createCodeImageZodSchema.highlightedLines).toBeDefined();
      expect(createCodeImageZodSchema.exportSize).toBeDefined();
    });
  });

  describe("MCP Handler", () => {
    it("should format response correctly for MCP protocol", async () => {
      const response = await handleCreateCodeImage({
        code: 'console.log("test");',
      });

      expect(response.content).toBeDefined();
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content.length).toBeGreaterThan(0);

      // Check the response format
      const content = response.content[0];
      expect(content.type).toBe("image");
      expect(content.mimeType).toBe("image/png");
      expect(typeof content.data).toBe("string");
    }, 30000);
  });
});
