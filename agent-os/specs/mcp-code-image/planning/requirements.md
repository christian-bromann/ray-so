# Requirements: MCP Integration for Code Image Feature

## Feature Description

Add Model Context Protocol (MCP) support to ray.so's code image generation feature. This will allow AI assistants (like Claude, Cursor, etc.) to programmatically generate beautiful code images/screenshots through MCP tools.

## Goals

1. Enable AI assistants to generate code images without manual UI interaction
2. Expose the full customization options available in the UI (themes, languages, padding, etc.)
3. Provide a seamless developer experience for MCP tool consumers

## Functional Requirements

### MCP Server

- Create an MCP server that exposes tools for code image generation
- The server should be runnable as a standalone process
- Support stdio transport for local MCP connections

### MCP Tools to Implement

1. **`create_code_image`** - Generate a code image

   - Input: code content, language, theme, padding, dark mode, background, line numbers, file name, highlighted lines
   - Output: Base64-encoded PNG image data or file path

2. **`list_themes`** - Return available themes

   - Output: Array of theme objects with id, name, and capabilities (dark mode support, etc.)

3. **`list_languages`** - Return supported programming languages
   - Output: Array of language objects with id and display name

### Image Generation

- Leverage existing code rendering logic (Shiki syntax highlighting, theme CSS)
- Support server-side rendering using Puppeteer or Playwright
- Generate PNG output at configurable resolution (2x, 4x, 6x)
- Optionally support SVG output

### Configuration Options

- All options should have sensible defaults
- Theme: default to "vercel" or similar
- Language: auto-detect if not specified
- Padding: 32px default
- Dark mode: true by default
- Background: true by default
- Line numbers: false by default
- Export size: 2x default

## Non-Functional Requirements

- MCP server should start quickly (< 2 seconds)
- Image generation should complete in < 5 seconds for typical code snippets
- Support code snippets up to 500 lines
- Memory-efficient for running alongside other processes

## Out of Scope

- Real-time preview/streaming of image generation
- Authentication/authorization for MCP server
- Image hosting or URL generation
- Video/animated output
- Multiple images in a single request
