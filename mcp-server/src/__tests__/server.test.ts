import { describe, it, expect } from "vitest";

describe("MCP Server Initialization", () => {
  it("should export required server functions", async () => {
    const serverModule = await import("../index");

    // Verify the module exports the required functions/objects
    expect(serverModule).toHaveProperty("server");
    expect(serverModule).toHaveProperty("startServer");
    expect(typeof serverModule.startServer).toBe("function");
  });

  it("should instantiate server without errors", async () => {
    const { server, SERVER_NAME, SERVER_VERSION } = await import("../index");

    // Verify server instance exists
    expect(server).toBeDefined();

    // Verify server configuration constants are exported
    expect(SERVER_NAME).toBe("ray-so-code-image");
    expect(SERVER_VERSION).toBe("1.0.0");

    // Verify server has expected MCP methods
    expect(typeof server.connect).toBe("function");
    expect(typeof server.close).toBe("function");
  });

  it("should configure stdio transport correctly", async () => {
    const { createStdioTransport } = await import("../index");

    // Verify stdio transport factory is exported and callable
    expect(typeof createStdioTransport).toBe("function");

    // Create transport and verify it has expected interface
    const transport = createStdioTransport();
    expect(transport).toBeDefined();
    expect(transport).toHaveProperty("start");
    expect(transport).toHaveProperty("close");
  });
});
