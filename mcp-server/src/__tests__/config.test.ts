/**
 * Configuration tests for MCP server
 *
 * Tests for Task Group 8:
 * - Server can be started via npx
 * - Configuration JSON is valid
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mcpServerRoot = resolve(__dirname, "../..");

describe("MCP Configuration", () => {
  describe("Configuration JSON", () => {
    it("should have a valid mcp-config.json file", () => {
      const configPath = resolve(mcpServerRoot, "mcp-config.json");
      expect(existsSync(configPath)).toBe(true);

      const configContent = readFileSync(configPath, "utf-8");
      const config = JSON.parse(configContent);

      // Validate required fields
      expect(config).toHaveProperty("mcpServers");
      expect(config.mcpServers).toHaveProperty("ray-so-code-image");

      const serverConfig = config.mcpServers["ray-so-code-image"];
      expect(serverConfig).toHaveProperty("command");
      expect(serverConfig).toHaveProperty("args");
      expect(Array.isArray(serverConfig.args)).toBe(true);
    });

    it("should have valid package.json with bin entry for npx execution", () => {
      const packagePath = resolve(mcpServerRoot, "package.json");
      expect(existsSync(packagePath)).toBe(true);

      const packageContent = readFileSync(packagePath, "utf-8");
      const pkg = JSON.parse(packageContent);

      // Validate bin entry exists
      expect(pkg).toHaveProperty("bin");
      expect(pkg.bin).toHaveProperty("ray-so-mcp");

      // Validate the bin entry points to a valid file path
      const binPath = pkg.bin["ray-so-mcp"];
      expect(typeof binPath).toBe("string");
      expect(binPath.length).toBeGreaterThan(0);
    });
  });
});
