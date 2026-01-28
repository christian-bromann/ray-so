import { describe, it, expect } from "vitest";
import { listThemes, ThemeInfo } from "../tools/list-themes";

describe("list_themes Tool", () => {
  describe("Theme object properties", () => {
    it("should return array of theme objects with correct properties", async () => {
      const themes = await listThemes();

      // Verify it returns an array
      expect(Array.isArray(themes)).toBe(true);

      // Verify we have 23+ themes (24 total minus hidden ones)
      expect(themes.length).toBeGreaterThanOrEqual(23);

      // Verify each theme object has all required properties
      for (const theme of themes) {
        expect(theme).toHaveProperty("id");
        expect(typeof theme.id).toBe("string");
        expect(theme.id.length).toBeGreaterThan(0);

        expect(theme).toHaveProperty("name");
        expect(typeof theme.name).toBe("string");
        expect(theme.name.length).toBeGreaterThan(0);

        expect(theme).toHaveProperty("hasDarkMode");
        expect(typeof theme.hasDarkMode).toBe("boolean");

        expect(theme).toHaveProperty("hasLightMode");
        expect(typeof theme.hasLightMode).toBe("boolean");

        expect(theme).toHaveProperty("isPartner");
        expect(typeof theme.isPartner).toBe("boolean");

        // Each theme should have at least one mode
        expect(theme.hasDarkMode || theme.hasLightMode).toBe(true);
      }

      // Verify specific themes are present
      const vercelTheme = themes.find((t) => t.id === "vercel");
      expect(vercelTheme).toBeDefined();
      expect(vercelTheme?.name).toBe("Vercel");
      expect(vercelTheme?.isPartner).toBe(true);
      expect(vercelTheme?.hasDarkMode).toBe(true);
      expect(vercelTheme?.hasLightMode).toBe(true);
    });
  });

  describe("Hidden themes filtering", () => {
    it("should filter out hidden themes (e.g., 'rabbit')", async () => {
      const themes = await listThemes();

      // Verify hidden theme "rabbit" is not included
      const rabbitTheme = themes.find((t) => t.id === "rabbit");
      expect(rabbitTheme).toBeUndefined();

      // Verify all IDs are unique
      const themeIds = themes.map((t) => t.id);
      const uniqueIds = new Set(themeIds);
      expect(themeIds.length).toBe(uniqueIds.size);
    });
  });

  describe("Sorting logic", () => {
    it("should sort partner themes first, then alphabetically by name", async () => {
      const themes = await listThemes();

      // Find where partner themes end
      let lastPartnerIndex = -1;
      for (let i = 0; i < themes.length; i++) {
        if (themes[i].isPartner) {
          lastPartnerIndex = i;
        }
      }

      // All partner themes should come before non-partner themes
      for (let i = 0; i < themes.length; i++) {
        if (i <= lastPartnerIndex) {
          expect(themes[i].isPartner).toBe(true);
        } else {
          expect(themes[i].isPartner).toBe(false);
        }
      }

      // Partner themes should be sorted alphabetically by name
      const partnerThemes = themes.filter((t) => t.isPartner);
      for (let i = 1; i < partnerThemes.length; i++) {
        const prevName = partnerThemes[i - 1].name.toLowerCase();
        const currName = partnerThemes[i].name.toLowerCase();
        expect(prevName <= currName).toBe(true);
      }

      // Non-partner themes should be sorted alphabetically by name
      const nonPartnerThemes = themes.filter((t) => !t.isPartner);
      for (let i = 1; i < nonPartnerThemes.length; i++) {
        const prevName = nonPartnerThemes[i - 1].name.toLowerCase();
        const currName = nonPartnerThemes[i].name.toLowerCase();
        expect(prevName <= currName).toBe(true);
      }
    });
  });
});
