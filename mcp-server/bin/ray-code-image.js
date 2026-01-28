#!/usr/bin/env node

/**
 * Ray.so Code Image MCP Server - CLI Entry Point
 *
 * This script is the main entry point for running the MCP server
 * via npx or as a globally installed command.
 *
 * Usage:
 *   npx ray-so-mcp-server
 *   node bin/ray-code-image.js
 */

import { startServer } from "../dist/index.js";

startServer().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
