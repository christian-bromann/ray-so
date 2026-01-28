/**
 * list_languages MCP Tool
 *
 * Returns a list of all available programming languages for code syntax highlighting,
 * sorted alphabetically by display name.
 */

import { z } from "zod";
import { getLanguagesSortedByName } from "../shared/languages";

/**
 * Language information returned by the list_languages tool
 */
export interface LanguageInfo {
  /** Unique language identifier (used in create_code_image) */
  id: string;
  /** Display name of the language */
  name: string;
}

/**
 * Lists all available languages for code syntax highlighting.
 *
 * @returns Array of LanguageInfo objects sorted alphabetically by name
 */
export async function listLanguages(): Promise<LanguageInfo[]> {
  // getLanguagesSortedByName already returns languages sorted by name
  return getLanguagesSortedByName();
}

/**
 * Empty Zod schema for tools with no parameters
 */
export const listLanguagesZodSchema = {};

/**
 * Tool schema definition for MCP registration
 */
export const listLanguagesToolSchema = {
  name: "list_languages",
  description:
    "List all available programming languages for code syntax highlighting. " +
    "Returns language IDs (for use with create_code_image) and display names, " +
    "sorted alphabetically by name.",
};

/**
 * Handler function for the list_languages tool.
 * This is called by the MCP server when the tool is invoked.
 */
export async function handleListLanguages(): Promise<{
  content: Array<{ type: "text"; text: string }>;
}> {
  const languages = await listLanguages();

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(languages, null, 2),
      },
    ],
  };
}
