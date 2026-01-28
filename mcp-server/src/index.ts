import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { listThemesToolSchema, listThemesZodSchema, handleListThemes } from "./tools/list-themes.js";
import { listLanguagesToolSchema, listLanguagesZodSchema, handleListLanguages } from "./tools/list-languages.js";
import {
  createCodeImageToolSchema,
  createCodeImageZodSchema,
  handleCreateCodeImage,
  type CreateCodeImageInput,
} from "./tools/create-code-image.js";
import { closeBrowser } from "./renderer/browser-manager.js";
import { closePagePool } from "./renderer/page-pool.js";
import { disposeHighlighter } from "./renderer/highlighter.js";

/**
 * MCP Server for ray.so code image generation
 *
 * This server exposes tools for AI assistants to programmatically generate
 * beautiful code images/screenshots via MCP (Model Context Protocol).
 */

// Server name and version
export const SERVER_NAME = "ray-so-code-image";
export const SERVER_VERSION = "1.0.0";

// Create the MCP server instance
export const server = new McpServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
});

// Register the list_themes tool
server.tool(listThemesToolSchema.name, listThemesToolSchema.description, listThemesZodSchema, async () =>
  handleListThemes(),
);

// Register the list_languages tool
server.tool(listLanguagesToolSchema.name, listLanguagesToolSchema.description, listLanguagesZodSchema, async () =>
  handleListLanguages(),
);

// Register the create_code_image tool
server.tool(
  createCodeImageToolSchema.name,
  createCodeImageToolSchema.description,
  createCodeImageZodSchema,
  async (params) => handleCreateCodeImage(params as unknown as CreateCodeImageInput),
);

/**
 * Creates a stdio transport for MCP communication.
 * This is the primary transport method for local MCP connections.
 */
export function createStdioTransport(): StdioServerTransport {
  return new StdioServerTransport();
}

/**
 * Starts the MCP server with stdio transport.
 * This is the main entry point for running the server.
 */
export async function startServer(): Promise<void> {
  const transport = createStdioTransport();

  // Connect the server to the transport
  await server.connect(transport);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    disposeHighlighter();
    await closePagePool();
    await closeBrowser();
    await server.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    disposeHighlighter();
    await closePagePool();
    await closeBrowser();
    await server.close();
    process.exit(0);
  });
}

// Start server if this is the main module
// Using a check that works with ES modules
const isMainModule = typeof require !== "undefined" && require.main === module;

if (isMainModule) {
  startServer().catch((error) => {
    console.error("Failed to start MCP server:", error);
    process.exit(1);
  });
}
