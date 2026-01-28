/**
 * MCP Server API Route for Vercel Deployment
 *
 * This route exposes the ray.so MCP server via HTTP transport,
 * supporting both Streamable HTTP and SSE for backwards compatibility.
 */

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

// Import tool handlers from mcp-server
import { listThemesToolSchema, handleListThemes } from "@mcp-server/tools/list-themes";
import { listLanguagesToolSchema, handleListLanguages } from "@mcp-server/tools/list-languages";
import {
  createCodeImageToolSchema,
  handleCreateCodeImage,
  type CreateCodeImageInput,
} from "@mcp-server/tools/create-code-image";
import { VALID_PADDINGS, VALID_EXPORT_SIZES } from "@mcp-server/shared/validators";

/**
 * Create the MCP handler with all tools registered
 */
const handler = createMcpHandler(
  (server) => {
    // Register list_themes tool (no parameters)
    server.tool(listThemesToolSchema.name, listThemesToolSchema.description, {}, async () => handleListThemes());

    // Register list_languages tool (no parameters)
    server.tool(listLanguagesToolSchema.name, listLanguagesToolSchema.description, {}, async () =>
      handleListLanguages(),
    );

    // Register create_code_image tool with Zod schema
    server.tool(
      createCodeImageToolSchema.name,
      createCodeImageToolSchema.description,
      {
        code: z.string().describe("The code to render as an image (required)"),
        language: z
          .string()
          .optional()
          .describe("Programming language for syntax highlighting. If not specified, language will be auto-detected."),
        theme: z.string().optional().describe('Theme ID for styling the code frame (default: "vercel")'),
        darkMode: z.boolean().optional().describe("Use dark mode variant of the theme (default: true)"),
        padding: z
          .enum(VALID_PADDINGS.map(String) as [string, ...string[]])
          .transform(Number)
          .optional()
          .describe("Padding around the code frame in pixels (default: 64)"),
        background: z.boolean().optional().describe("Show theme background gradient (default: true)"),
        lineNumbers: z.boolean().optional().describe("Show line numbers (default: false)"),
        fileName: z.string().optional().describe("Filename to display in the frame header"),
        highlightedLines: z.array(z.number()).optional().describe("Line numbers to highlight (1-indexed)"),
        exportSize: z
          .enum(VALID_EXPORT_SIZES.map(String) as [string, ...string[]])
          .transform(Number)
          .optional()
          .describe("Export size / pixel ratio: 2 (1x), 4 (2x), or 6 (3x) (default: 2)"),
      },
      async (params) => handleCreateCodeImage(params as unknown as CreateCodeImageInput),
    );
  },
  {
    serverInfo: {
      name: "ray-so-code-image",
      version: "1.0.0",
    },
  },
  {
    basePath: "/api",
  },
);

// Export handlers for all HTTP methods used by MCP
export { handler as GET, handler as POST, handler as DELETE };

// Vercel function configuration for browser automation
export const config = {
  maxDuration: 60, // 60 second timeout for image generation
};
