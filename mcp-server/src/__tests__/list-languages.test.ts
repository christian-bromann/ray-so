import { describe, it, expect } from "vitest";
import {
  listLanguages,
  handleListLanguages,
  listLanguagesToolSchema,
  type LanguageInfo,
} from "../tools/list-languages";
import { LANGUAGES } from "../shared/languages";

describe("list_languages MCP Tool", () => {
  it("should return array of language objects with id and name", async () => {
    // Call the handler function directly
    const result = await handleListLanguages();

    // Verify result structure matches MCP tool response format
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBe(1);
    expect(result.content[0].type).toBe("text");

    // Parse the JSON response
    const languages: LanguageInfo[] = JSON.parse(result.content[0].text);

    // Verify it's an array with 45+ languages (matching LANGUAGES object)
    expect(Array.isArray(languages)).toBe(true);
    const languageCount = Object.keys(LANGUAGES).length;
    expect(languages.length).toBe(languageCount);
    expect(languages.length).toBeGreaterThanOrEqual(45);

    // Verify each language object has required properties
    for (const lang of languages) {
      expect(lang).toHaveProperty("id");
      expect(lang).toHaveProperty("name");
      expect(typeof lang.id).toBe("string");
      expect(typeof lang.name).toBe("string");
      expect(lang.id.length).toBeGreaterThan(0);
      expect(lang.name.length).toBeGreaterThan(0);
    }

    // Verify specific languages are present
    const jsLang = languages.find((l) => l.id === "javascript");
    expect(jsLang).toBeDefined();
    expect(jsLang!.name).toBe("JavaScript");

    const pyLang = languages.find((l) => l.id === "python");
    expect(pyLang).toBeDefined();
    expect(pyLang!.name).toBe("Python");

    const tsLang = languages.find((l) => l.id === "typescript");
    expect(tsLang).toBeDefined();
    expect(tsLang!.name).toBe("TypeScript");

    // Verify tool schema is properly defined
    expect(listLanguagesToolSchema.name).toBe("list_languages");
    expect(listLanguagesToolSchema.description).toContain("language");
  });

  it("should return languages sorted alphabetically by display name", async () => {
    // Use the listLanguages function directly for easier testing
    const languages = await listLanguages();

    // Verify we have languages
    expect(languages.length).toBeGreaterThanOrEqual(45);

    // Verify sorting - each name should be <= the next name alphabetically
    for (let i = 0; i < languages.length - 1; i++) {
      const current = languages[i].name.toLowerCase();
      const next = languages[i + 1].name.toLowerCase();
      expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
    }

    // Verify Astro comes before Bash (A before B)
    const astroIndex = languages.findIndex((l) => l.name === "Astro");
    const bashIndex = languages.findIndex((l) => l.name === "Bash");
    expect(astroIndex).toBeGreaterThanOrEqual(0);
    expect(bashIndex).toBeGreaterThanOrEqual(0);
    expect(astroIndex).toBeLessThan(bashIndex);

    // Verify TypeScript comes before V (T before V)
    const tsIndex = languages.findIndex((l) => l.name === "TypeScript");
    const vIndex = languages.findIndex((l) => l.name === "V");
    expect(tsIndex).toBeGreaterThanOrEqual(0);
    expect(vIndex).toBeGreaterThanOrEqual(0);
    expect(tsIndex).toBeLessThan(vIndex);

    // Verify Zig is near the end (starts with Z)
    const zigIndex = languages.findIndex((l) => l.name === "Zig");
    expect(zigIndex).toBeGreaterThanOrEqual(0);
    expect(zigIndex).toBe(languages.length - 1);
  });
});
