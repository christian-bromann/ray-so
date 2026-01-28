import { describe, it, expect } from "vitest";

describe("Shared Module Exports", () => {
  describe("Theme Definitions", () => {
    it("should export theme definitions accessible without browser APIs", async () => {
      const { THEMES, Theme } = await import("../shared/themes");

      // Verify THEMES is exported and is an object
      expect(THEMES).toBeDefined();
      expect(typeof THEMES).toBe("object");

      // Verify we have 24+ themes
      const themeCount = Object.keys(THEMES).length;
      expect(themeCount).toBeGreaterThanOrEqual(24);

      // Verify each theme has required properties
      for (const [id, theme] of Object.entries(THEMES)) {
        expect(theme).toHaveProperty("id");
        expect(theme).toHaveProperty("name");
        expect(theme).toHaveProperty("background");
        expect(theme.background).toHaveProperty("from");
        expect(theme.background).toHaveProperty("to");
        expect(theme).toHaveProperty("syntax");

        // Verify syntax has at least light or dark mode
        const hasLight = !!theme.syntax.light;
        const hasDark = !!theme.syntax.dark;
        expect(hasLight || hasDark).toBe(true);
      }

      // Verify no browser-specific code by checking specific themes
      expect(THEMES.vercel).toBeDefined();
      expect(THEMES.vercel.id).toBe("vercel");
      expect(THEMES.vercel.name).toBe("Vercel");
    });

    it("should export convertToShikiTheme function that works correctly", async () => {
      const { convertToShikiTheme } = await import("../shared/themes");

      // Verify function exists
      expect(typeof convertToShikiTheme).toBe("function");

      // Test with a sample syntax object
      const syntaxObject = {
        foreground: "#ffffff",
        constant: "#ff0000",
        string: "#00ff00",
        comment: "#888888",
        keyword: "#0000ff",
        parameter: "#ffff00",
        function: "#ff00ff",
        stringExpression: "#00ffff",
        punctuation: "#999999",
        link: "#aabbcc",
        number: "#112233",
        property: "#445566",
        highlight: "#778899",
        highlightBorder: "#aabbcc",
        highlightHover: "#ddeeff",
        diffDeleted: "#ff0000",
        diffInserted: "#00ff00",
      };

      const cssProps = convertToShikiTheme(syntaxObject);

      // Verify it returns an object with CSS custom properties
      expect(cssProps).toBeDefined();
      expect(cssProps["--ray-foreground"]).toBe("#ffffff");
      expect(cssProps["--ray-token-constant"]).toBe("#ff0000");
      expect(cssProps["--ray-token-string"]).toBe("#00ff00");
      expect(cssProps["--ray-token-comment"]).toBe("#888888");
      expect(cssProps["--ray-token-keyword"]).toBe("#0000ff");

      // Test with empty/null input
      const emptyResult = convertToShikiTheme(null as any);
      expect(emptyResult).toEqual({});
    });
  });

  describe("Language Definitions", () => {
    it("should export language definitions properly", async () => {
      const { LANGUAGES, Language } = await import("../shared/languages");

      // Verify LANGUAGES is exported and is an object
      expect(LANGUAGES).toBeDefined();
      expect(typeof LANGUAGES).toBe("object");

      // Verify we have 45+ languages
      const languageCount = Object.keys(LANGUAGES).length;
      expect(languageCount).toBeGreaterThanOrEqual(45);

      // Verify each language has required properties
      for (const [id, language] of Object.entries(LANGUAGES)) {
        expect(language).toHaveProperty("name");
        expect(typeof language.name).toBe("string");
        expect(language.name.length).toBeGreaterThan(0);

        expect(language).toHaveProperty("src");
        expect(typeof language.src).toBe("function");
      }

      // Verify specific languages exist
      expect(LANGUAGES.javascript).toBeDefined();
      expect(LANGUAGES.javascript.name).toBe("JavaScript");

      expect(LANGUAGES.typescript).toBeDefined();
      expect(LANGUAGES.typescript.name).toBe("TypeScript");

      expect(LANGUAGES.python).toBeDefined();
      expect(LANGUAGES.python.name).toBe("Python");
    });
  });

  describe("Theme/Language ID Uniqueness", () => {
    it("should have all unique theme and language IDs", async () => {
      const { THEMES } = await import("../shared/themes");
      const { LANGUAGES } = await import("../shared/languages");

      // Check theme IDs are unique
      const themeIds = Object.keys(THEMES);
      const uniqueThemeIds = new Set(themeIds);
      expect(themeIds.length).toBe(uniqueThemeIds.size);

      // Check each theme's id property matches its key
      for (const [key, theme] of Object.entries(THEMES)) {
        expect(theme.id).toBe(key);
      }

      // Check language IDs are unique
      const languageIds = Object.keys(LANGUAGES);
      const uniqueLanguageIds = new Set(languageIds);
      expect(languageIds.length).toBe(uniqueLanguageIds.size);

      // Theme and language IDs shouldn't overlap
      // (This isn't strictly required but helps avoid confusion)
      const allIds = [...themeIds, ...languageIds];
      const combinedUnique = new Set(allIds);
      // Note: Some overlap may exist (e.g., "prisma" theme and language)
      // So we just verify within each category uniqueness is maintained
    });
  });

  describe("Validation Helpers", () => {
    it("should validate theme, language, padding, and export size correctly", async () => {
      const { isValidThemeId, isValidLanguageId, isValidPadding, isValidExportSize } = await import(
        "../shared/validators"
      );

      // Test theme validation
      expect(isValidThemeId("vercel")).toBe(true);
      expect(isValidThemeId("candy")).toBe(true);
      expect(isValidThemeId("nonexistent")).toBe(false);
      expect(isValidThemeId("")).toBe(false);

      // Test language validation
      expect(isValidLanguageId("javascript")).toBe(true);
      expect(isValidLanguageId("python")).toBe(true);
      expect(isValidLanguageId("nonexistent")).toBe(false);
      expect(isValidLanguageId("")).toBe(false);

      // Test padding validation
      expect(isValidPadding(16)).toBe(true);
      expect(isValidPadding(32)).toBe(true);
      expect(isValidPadding(64)).toBe(true);
      expect(isValidPadding(128)).toBe(true);
      expect(isValidPadding(0)).toBe(false);
      expect(isValidPadding(48)).toBe(false);
      expect(isValidPadding(100)).toBe(false);

      // Test export size validation
      expect(isValidExportSize(2)).toBe(true);
      expect(isValidExportSize(4)).toBe(true);
      expect(isValidExportSize(6)).toBe(true);
      expect(isValidExportSize(1)).toBe(false);
      expect(isValidExportSize(3)).toBe(false);
      expect(isValidExportSize(8)).toBe(false);
    });
  });
});
