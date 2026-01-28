/**
 * list_themes MCP Tool
 *
 * Returns a list of available themes for code image generation.
 * Excludes hidden themes and sorts results with partner themes first,
 * then alphabetically by name within each group.
 */

import { z } from "zod";
import { THEMES, type Theme } from "../shared/themes.js";

/**
 * Theme information returned by the list_themes tool
 */
export interface ThemeInfo {
  /** Unique theme identifier */
  id: string;
  /** Display name of the theme */
  name: string;
  /** Whether the theme supports dark mode */
  hasDarkMode: boolean;
  /** Whether the theme supports light mode */
  hasLightMode: boolean;
  /** Whether this is a partner/branded theme */
  isPartner: boolean;
}

/**
 * Formats a Theme object into a ThemeInfo response object.
 */
function formatThemeInfo(theme: Theme): ThemeInfo {
  return {
    id: theme.id,
    name: theme.name,
    hasDarkMode: !!theme.syntax.dark,
    hasLightMode: !!theme.syntax.light,
    isPartner: !!theme.partner,
  };
}

/**
 * Sorts themes with partner themes first, then alphabetically by name.
 */
function sortThemes(a: ThemeInfo, b: ThemeInfo): number {
  // Partner themes come first
  if (a.isPartner !== b.isPartner) {
    return a.isPartner ? -1 : 1;
  }

  // Within each group, sort alphabetically by name (case-insensitive)
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

/**
 * Lists all available (non-hidden) themes for code image generation.
 *
 * @returns Array of ThemeInfo objects sorted by partner status and name
 */
export async function listThemes(): Promise<ThemeInfo[]> {
  const themes: ThemeInfo[] = [];

  // Iterate through all themes, filtering out hidden ones
  for (const themeId of Object.keys(THEMES)) {
    const theme = THEMES[themeId];

    // Skip hidden themes
    if (theme.hidden) {
      continue;
    }

    themes.push(formatThemeInfo(theme));
  }

  // Sort themes: partner first, then alphabetically by name
  themes.sort(sortThemes);

  return themes;
}

/**
 * Empty Zod schema for tools with no parameters
 */
export const listThemesZodSchema = {};

/**
 * Tool schema definition for MCP registration
 */
export const listThemesToolSchema = {
  name: "list_themes",
  description:
    "List all available themes for code image generation. Returns theme IDs, names, and supported color modes (light/dark). Partner themes (from companies like Vercel, Supabase, etc.) are listed first.",
};

/**
 * Handler function for the list_themes tool.
 * This is called by the MCP server when the tool is invoked.
 */
export async function handleListThemes(): Promise<{
  content: Array<{ type: "text"; text: string }>;
}> {
  const themes = await listThemes();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(themes, null, 2),
      },
    ],
  };
}
