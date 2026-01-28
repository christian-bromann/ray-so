/**
 * Tests for HTML Generation (Task Group 4)
 *
 * Tests the code frame HTML generation functionality including:
 * - Theme CSS variables
 * - Syntax highlighting
 * - Line numbers
 * - Highlighted lines
 * - Frame styling
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getHighlighter, highlightCode } from "../renderer/highlighter.js";
import { generateCodeFrameHtml } from "../renderer/frame-renderer.js";
import { renderHighlightedCode } from "../renderer/code-renderer.js";
import { generateHtmlTemplate } from "../renderer/html-template.js";
import { THEMES } from "../shared/themes.js";

describe("HTML Generation", () => {
  describe("Theme CSS Variables", () => {
    it("should include proper CSS variables for theme", async () => {
      const html = await generateCodeFrameHtml({
        code: 'const x = "hello";',
        theme: "vercel",
        darkMode: true,
        language: "javascript",
      });

      // Verify CSS variables are present
      expect(html).toContain("--ray-foreground");
      expect(html).toContain("--ray-token-keyword");
      expect(html).toContain("--ray-token-string");

      // Verify theme-specific colors are included
      const vercelDark = THEMES.vercel.syntax.dark!;
      expect(html).toContain(vercelDark["--ray-foreground"]);
    });
  });

  describe("Syntax Highlighting", () => {
    it("should apply code syntax highlighting", async () => {
      const highlighter = await getHighlighter();
      const code = `function hello() {
  return "world";
}`;

      const highlighted = await highlightCode(highlighter, code, "javascript");

      // Verify Shiki output structure
      expect(highlighted).toContain("<pre");
      expect(highlighted).toContain("<code");
      expect(highlighted).toContain('class="shiki');

      // Verify code is wrapped in line spans
      expect(highlighted).toContain('class="line"');

      // Verify tokens are highlighted
      expect(highlighted).toContain("<span");
    });
  });

  describe("Line Numbers", () => {
    it("should show line numbers when enabled", async () => {
      const html = await generateCodeFrameHtml({
        code: `const a = 1;
const b = 2;
const c = 3;`,
        theme: "vercel",
        darkMode: true,
        language: "javascript",
        lineNumbers: true,
      });

      // Line numbers are shown via CSS using data-line attribute and :before pseudo-element
      expect(html).toContain('data-line="1"');
      expect(html).toContain('data-line="2"');
      expect(html).toContain('data-line="3"');

      // Check that line numbers styling class is present
      expect(html).toContain("showLineNumbers");
    });

    it("should hide line numbers when disabled", async () => {
      const html = await generateCodeFrameHtml({
        code: `const a = 1;
const b = 2;`,
        theme: "vercel",
        darkMode: true,
        language: "javascript",
        lineNumbers: false,
      });

      // The editor div should NOT have showLineNumbers class
      // But the CSS definitions will still be in the stylesheet
      // Check that the editor element does not have the class
      expect(html).toMatch(/<div class="editor">/);
      expect(html).not.toMatch(/<div class="editor showLineNumbers/);
    });
  });

  describe("Highlighted Lines", () => {
    it("should mark highlighted lines correctly", async () => {
      const code = `line 1
line 2
line 3
line 4`;
      const highlightedLines = [2, 4];

      const rendered = await renderHighlightedCode({
        code,
        language: "plaintext",
        highlightedLines,
      });

      // Lines 2 and 4 should have highlighted-line class
      expect(rendered).toContain("highlighted-line");

      // Verify the correct lines are marked
      const lines = rendered.split("\n");
      const highlightedLineMatches = rendered.match(/highlighted-line/g);
      expect(highlightedLineMatches?.length).toBe(2);
    });
  });

  describe("Frame Styling", () => {
    it("should match selected theme frame styling", async () => {
      // Test vercel theme
      const vercelHtml = await generateCodeFrameHtml({
        code: 'console.log("hello");',
        theme: "vercel",
        darkMode: true,
        language: "javascript",
      });

      expect(vercelHtml).toContain("vercel");
      expect(vercelHtml).toContain("vercelWindow");

      // Test supabase theme
      const supabaseHtml = await generateCodeFrameHtml({
        code: 'console.log("hello");',
        theme: "supabase",
        darkMode: true,
        language: "javascript",
      });

      expect(supabaseHtml).toContain("supabase");
      expect(supabaseHtml).toContain("supabaseWindow");

      // Test tailwind theme
      const tailwindHtml = await generateCodeFrameHtml({
        code: 'console.log("hello");',
        theme: "tailwind",
        darkMode: false,
        language: "javascript",
      });

      expect(tailwindHtml).toContain("tailwind");
      expect(tailwindHtml).toContain("tailwindWindow");
    });

    it("should apply padding option", async () => {
      const html = await generateCodeFrameHtml({
        code: "const x = 1;",
        theme: "vercel",
        darkMode: true,
        language: "javascript",
        padding: 128,
      });

      expect(html).toContain("padding: 128px");
    });

    it("should handle background option", async () => {
      // With background
      const withBg = await generateCodeFrameHtml({
        code: "const x = 1;",
        theme: "vercel",
        darkMode: true,
        language: "javascript",
        background: true,
      });

      // The frame div should not have noBackground class when background is true
      expect(withBg).toMatch(/<div class="frame vercelFrame"/);
      expect(withBg).not.toMatch(/<div class="frame vercelFrame noBackground"/);

      // Without background
      const noBg = await generateCodeFrameHtml({
        code: "const x = 1;",
        theme: "vercel",
        darkMode: true,
        language: "javascript",
        background: false,
      });

      // The frame div should have noBackground class when background is false
      expect(noBg).toMatch(/class="[^"]*noBackground[^"]*"/);
    });

    it("should include filename when provided", async () => {
      const html = await generateCodeFrameHtml({
        code: 'export const hello = "world";',
        theme: "browserbase",
        darkMode: true,
        language: "javascript",
        fileName: "index.ts",
      });

      expect(html).toContain("index.ts");
    });
  });

  describe("HTML Template", () => {
    it("should generate valid HTML document", () => {
      const template = generateHtmlTemplate({
        content: '<div class="test">content</div>',
        theme: THEMES.vercel,
        darkMode: true,
      });

      expect(template).toContain("<!DOCTYPE html>");
      expect(template).toContain("<html");
      expect(template).toContain("</html>");
      expect(template).toContain('<div class="test">content</div>');
    });

    it("should include font loading", () => {
      const template = generateHtmlTemplate({
        content: "<div>test</div>",
        theme: THEMES.vercel,
        darkMode: true,
      });

      // Should include font-face declarations
      expect(template).toContain("@font-face");
    });
  });
});
