# Task Breakdown: MCP Integration for Code Image Generation

## Overview

Total Tasks: 32

This task breakdown implements an MCP server that enables AI assistants to programmatically generate beautiful code images via MCP tools. The implementation leverages existing ray.so theme definitions, language mappings, and Shiki syntax highlighting.

## Task List

### MCP Server Foundation

#### Task Group 1: Project Setup & Dependencies

**Dependencies:** None

- [x] 1.0 Complete MCP server project setup
  - [x] 1.1 Write 3 focused tests for MCP server initialization
    - Test that MCP server module exports required functions
    - Test that server can be instantiated without errors
    - Test that stdio transport is configured correctly
  - [x] 1.2 Add MCP SDK and Playwright dependencies to package.json
    - Add `@modelcontextprotocol/sdk` for MCP server implementation
    - Add `playwright` for headless browser rendering
    - Add any required peer dependencies
  - [x] 1.3 Create MCP server directory structure
    - Create `mcp-server/` directory at project root
    - Create `mcp-server/src/` for source files
    - Create `mcp-server/src/tools/` for tool implementations
    - Create `mcp-server/src/utils/` for shared utilities
  - [x] 1.4 Create base MCP server entry point (`mcp-server/src/index.ts`)
    - Import MCP SDK server primitives
    - Configure stdio transport
    - Set up tool registration structure
    - Export server instance
  - [x] 1.5 Create tsconfig for MCP server package
    - Configure for Node.js target
    - Enable strict mode
    - Set up path mappings to shared code
  - [x] 1.6 Add npm scripts for MCP server
    - Add `mcp:build` script to compile TypeScript
    - Add `mcp:start` script to run the server
    - Add `mcp:dev` script for development with watch mode
  - [x] 1.7 Ensure Task Group 1 tests pass
    - Run ONLY tests written in 1.1

**Acceptance Criteria:**

- MCP server initializes without errors
- Server responds to MCP protocol handshake
- Startup time is under 2 seconds
- All dependencies are properly installed

---

#### Task Group 2: Shared Code Extraction

**Dependencies:** Task Group 1 (completed)

- [x] 2.0 Complete shared code extraction for server-side usage
  - [x] 2.1 Write 4 focused tests for shared module exports
    - Test that theme definitions are accessible without browser APIs
    - Test that language definitions are properly exported
    - Test that theme CSS conversion functions work correctly
    - Test that all theme/language IDs are unique
  - [x] 2.2 Create shared theme definitions module (`mcp-server/src/shared/themes.ts`)
    - Extract THEMES object from `app/(navigation)/(code)/store/themes.ts`
    - Remove Jotai atoms and browser-specific code
    - Export Theme type and THEMES constant
    - Export `convertToShikiTheme` function
  - [x] 2.3 Create shared language definitions module (`mcp-server/src/shared/languages.ts`)
    - Extract LANGUAGES object from `app/(navigation)/(code)/util/languages.ts`
    - Adapt dynamic imports for Node.js environment
    - Export Language type and LANGUAGES constant
  - [x] 2.4 Create theme CSS utilities (`mcp-server/src/shared/theme-css.ts`)
    - Port `createCssVariablesTheme` function for server-side use
    - Create helper to generate inline CSS from theme syntax objects
    - Export utility functions for Shiki theming
  - [x] 2.5 Add validation helpers (`mcp-server/src/shared/validators.ts`)
    - Create `isValidThemeId(id: string): boolean`
    - Create `isValidLanguageId(id: string): boolean`
    - Create `isValidPadding(value: number): boolean`
    - Create `isValidExportSize(value: number): boolean`
  - [x] 2.6 Ensure Task Group 2 tests pass
    - Run ONLY tests written in 2.1

**Acceptance Criteria:**

- Theme definitions work in Node.js without browser APIs
- Language definitions properly export all 45+ languages
- CSS generation produces valid inline styles
- All validation functions work correctly

---

### Server-Side Rendering Engine

#### Task Group 3: Playwright Renderer Setup

**Dependencies:** Task Group 1

- [x] 3.0 Complete Playwright renderer infrastructure
  - [x] 3.1 Write 4 focused tests for Playwright renderer
    - Test browser launch and page creation
    - Test graceful shutdown and resource cleanup
    - Test basic HTML rendering to image
    - Test rendering with custom viewport dimensions
  - [x] 3.2 Create Playwright browser manager (`mcp-server/src/renderer/browser-manager.ts`)
    - Implement singleton browser instance management
    - Create `getBrowser()` function with lazy initialization
    - Create `closeBrowser()` function for cleanup
    - Handle browser crash recovery
  - [x] 3.3 Create page pool for concurrent rendering (`mcp-server/src/renderer/page-pool.ts`)
    - Implement page creation with optimal settings
    - Configure viewport, device scale factor
    - Set up page reuse to improve performance
    - Implement page cleanup between renders
  - [x] 3.4 Create screenshot capture utility (`mcp-server/src/renderer/screenshot.ts`)
    - Implement `captureScreenshot(html: string, options: ScreenshotOptions): Promise<Buffer>`
    - Support pixel ratio configuration (2x, 4x, 6x)
    - Support custom viewport dimensions
    - Return PNG buffer
  - [x] 3.5 Add timeout and error handling
    - Implement 30-second timeout for image generation
    - Handle Playwright errors gracefully
    - Return clear error messages
  - [x] 3.6 Ensure Task Group 3 tests pass
    - Run ONLY tests written in 3.1

**Acceptance Criteria:**

- Browser launches reliably in headless mode
- Pages render HTML content correctly
- Screenshots capture at specified pixel ratios
- Resources are properly cleaned up
- 30-second timeout is enforced

---

#### Task Group 4: Code Frame HTML Generation

**Dependencies:** Task Group 2 (completed), Task Group 3 (completed)

- [x] 4.0 Complete code frame HTML generation
  - [x] 4.1 Write 5 focused tests for HTML generation
    - Test HTML output includes proper CSS variables for theme
    - Test code syntax highlighting is applied
    - Test line numbers appear when enabled
    - Test highlighted lines are marked correctly
    - Test frame styling matches selected theme
  - [x] 4.2 Create Shiki highlighter wrapper (`mcp-server/src/renderer/highlighter.ts`)
    - Initialize Shiki with CSS variables theme
    - Lazy-load language grammars on demand
    - Implement code highlighting with line annotations
    - Cache highlighter instance for reuse
  - [x] 4.3 Create HTML template generator (`mcp-server/src/renderer/html-template.ts`)
    - Create base HTML template with required styles
    - Include font loading (from existing font definitions)
    - Include theme-specific CSS variables
    - Support all frame styling options
  - [x] 4.4 Create frame renderer (`mcp-server/src/renderer/frame-renderer.ts`)
    - Port Frame component logic to server-side HTML generation
    - Support all 24+ theme frame variants
    - Include window chrome (controls, header, filename)
    - Apply padding and background options
  - [x] 4.5 Create highlighted code renderer (`mcp-server/src/renderer/code-renderer.ts`)
    - Port HighlightedCode component logic
    - Apply line highlighting
    - Apply line numbers when enabled
    - Handle plaintext fallback
  - [x] 4.6 Integrate language auto-detection
    - Use highlight.js for language detection (existing in codebase)
    - Fall back to plaintext if detection fails
    - Validate detected language against LANGUAGES
  - [x] 4.7 Ensure Task Group 4 tests pass
    - Run ONLY tests written in 4.1

**Acceptance Criteria:**

- HTML output renders correctly in Playwright
- All 24+ themes produce correct styling
- Syntax highlighting matches browser rendering
- Line numbers and highlights work correctly
- Language auto-detection functions properly

---

### MCP Tools Implementation

#### Task Group 5: list_themes Tool

**Dependencies:** Task Group 2 (completed)

- [x] 5.0 Complete list_themes MCP tool
  - [x] 5.1 Write 3 focused tests for list_themes tool
    - Test returns array of theme objects with correct properties
    - Test hidden themes (e.g., "rabbit") are filtered out
    - Test partner themes are sorted first, then alphabetically
  - [x] 5.2 Create list_themes tool handler (`mcp-server/src/tools/list-themes.ts`)
    - Define tool schema with name and description
    - Implement handler that iterates THEMES object
    - Filter out themes with `hidden: true`
    - Return array of theme objects
  - [x] 5.3 Format theme response objects
    - Include: id, name, hasDarkMode, hasLightMode, isPartner
    - Derive hasDarkMode from `!!theme.syntax.dark`
    - Derive hasLightMode from `!!theme.syntax.light`
    - Map partner flag from theme.partner
  - [x] 5.4 Implement sorting logic
    - Partner themes first
    - Alphabetical by name within each group
  - [x] 5.5 Register tool with MCP server
    - Add tool to server tool registry
    - Verify tool appears in tool listing
  - [x] 5.6 Ensure Task Group 5 tests pass
    - Run ONLY tests written in 5.1

**Acceptance Criteria:**

- Tool returns 23+ themes (24 minus hidden)
- Each theme object has all required properties
- Hidden themes are excluded
- Partner themes appear first in list

---

#### Task Group 6: list_languages Tool

**Dependencies:** Task Group 2 (completed)

- [x] 6.0 Complete list_languages MCP tool
  - [x] 6.1 Write 2 focused tests for list_languages tool
    - Test returns array of language objects with id and name
    - Test languages are sorted alphabetically by display name
  - [x] 6.2 Create list_languages tool handler (`mcp-server/src/tools/list-languages.ts`)
    - Define tool schema with name and description
    - Implement handler that iterates LANGUAGES object
    - Return array of language objects
  - [x] 6.3 Format language response objects
    - Include: id, name
    - Extract id from object key
    - Extract name from language.name
  - [x] 6.4 Implement alphabetical sorting by display name
  - [x] 6.5 Register tool with MCP server
    - Add tool to server tool registry
    - Verify tool appears in tool listing
  - [x] 6.6 Ensure Task Group 6 tests pass
    - Run ONLY tests written in 6.1

**Acceptance Criteria:**

- Tool returns 45+ languages
- Each language object has id and name
- Languages are sorted alphabetically by name

---

#### Task Group 7: create_code_image Tool

**Dependencies:** Task Group 4, Task Group 5, Task Group 6

- [x] 7.0 Complete create_code_image MCP tool
  - [x] 7.1 Write 6 focused tests for create_code_image tool
    - Test generates valid base64 PNG for simple code input
    - Test applies specified theme correctly
    - Test applies specified language highlighting
    - Test respects all optional parameters (padding, darkMode, etc.)
    - Test returns error for invalid theme ID
    - Test returns error for empty code input
  - [x] 7.2 Create create_code_image tool handler (`mcp-server/src/tools/create-code-image.ts`)
    - Define tool schema with all parameters:
      - `code` (string, required)
      - `language` (string, optional)
      - `theme` (string, optional, default "vercel")
      - `darkMode` (boolean, optional, default true)
      - `padding` (number, optional, enum: 16|32|64|128, default 64)
      - `background` (boolean, optional, default true)
      - `lineNumbers` (boolean, optional, default false)
      - `fileName` (string, optional)
      - `highlightedLines` (array of numbers, optional)
      - `exportSize` (number, optional, enum: 2|4|6, default 2)
  - [x] 7.3 Implement input validation
    - Validate code is non-empty string
    - Validate theme ID if provided
    - Validate language ID if provided
    - Validate padding value is in allowed set
    - Validate exportSize value is in allowed set
    - Validate highlightedLines are positive integers
  - [x] 7.4 Implement image generation pipeline
    - Apply defaults for optional parameters
    - Auto-detect language if not specified
    - Generate HTML using frame renderer
    - Capture screenshot using Playwright
    - Convert to base64
    - Return result
  - [x] 7.5 Format success response
    - Return object with `image` field containing base64 PNG data
    - Include `mimeType: "image/png"`
    - Include `width` and `height` in pixels
  - [x] 7.6 Format error responses
    - Return clear error messages for validation failures
    - Return timeout error if generation exceeds 30 seconds
    - Include error code for programmatic handling
  - [x] 7.7 Register tool with MCP server
    - Add tool to server tool registry
    - Verify tool appears in tool listing
  - [x] 7.8 Ensure Task Group 7 tests pass
    - Run ONLY tests written in 7.1

**Acceptance Criteria:**

- Tool generates valid PNG images
- All optional parameters work correctly
- Default values are applied appropriately
- Invalid inputs produce clear error messages
- Image generation completes within 5 seconds for typical code
- Code snippets up to 500 lines are supported

---

### Integration & Configuration

#### Task Group 8: MCP Configuration Export

**Dependencies:** Task Group 7 (completed)

- [x] 8.0 Complete MCP server configuration and documentation
  - [x] 8.1 Write 2 focused tests for configuration
    - Test that server can be started via npx
    - Test that configuration JSON is valid
  - [x] 8.2 Create MCP server configuration file (`mcp-server/mcp-config.json`)
    - Define server name and description
    - Specify command to start server
    - Include tool capabilities
  - [x] 8.3 Create bin entry point for npx execution
    - Add `bin` field to mcp-server package.json
    - Create executable entry script (`mcp-server/bin/ray-code-image.js`)
    - Ensure proper shebang for Node.js
  - [x] 8.4 Add README for MCP server (`mcp-server/README.md`)
    - Document installation instructions
    - Document configuration for Claude, Cursor
    - Provide usage examples for each tool
    - Document all parameters and their options
  - [x] 8.5 Ensure Task Group 8 tests pass (SKIPPED per instructions)

**Acceptance Criteria:**

- Server can be started with `npx` or `node` command
- Configuration exports correctly for MCP clients
- Documentation is clear and complete

---

#### Task Group 9: Performance & Polish (SKIPPED)

**Dependencies:** Task Group 7
**Status:** Skipped per user request - can be addressed in future iteration

- [x] 9.0 Complete performance optimization and error handling (SKIPPED)
  - [x] 9.1 Write 3 focused tests for performance (SKIPPED)
  - [x] 9.2 Optimize browser initialization (SKIPPED)
  - [x] 9.3 Optimize Shiki highlighter loading (SKIPPED)
  - [x] 9.4 Add memory management (SKIPPED)
  - [x] 9.5 Add logging (SKIPPED)
  - [x] 9.6 Ensure Task Group 9 tests pass (SKIPPED)

**Acceptance Criteria:**

- Server starts in under 2 seconds
- Typical image generation completes in under 5 seconds
- 500-line code snippets render within 30 seconds
- Memory usage remains stable under load

---

## Execution Order

The recommended execution sequence for these task groups:

1. **Task Group 1: Project Setup & Dependencies** - Foundation for all other work
2. **Task Group 2: Shared Code Extraction** - Required for tools and rendering
3. **Task Group 3: Playwright Renderer Setup** - Core rendering infrastructure
4. **Task Group 5: list_themes Tool** - Simpler tool, can parallel with 3
5. **Task Group 6: list_languages Tool** - Simpler tool, can parallel with 3
6. **Task Group 4: Code Frame HTML Generation** - Depends on 2, 3
7. **Task Group 7: create_code_image Tool** - Main feature, depends on 4, 5, 6
8. **Task Group 8: MCP Configuration Export** - Finalization after tools work
9. **Task Group 9: Performance & Polish** - Optimization pass

**Parallel Execution Opportunities:**

- Groups 5 & 6 can run in parallel with Group 3
- Groups 5 & 6 can run in parallel with each other

## Notes

### Key Files to Reference

- `app/(navigation)/(code)/store/themes.ts` - Theme definitions (24+ themes)
- `app/(navigation)/(code)/util/languages.ts` - Language definitions (45+ languages)
- `app/(navigation)/(code)/components/Frame.tsx` - Frame rendering logic
- `app/(navigation)/(code)/components/HighlightedCode.tsx` - Syntax highlighting
- `app/(navigation)/(code)/lib/image.ts` - Current image export logic
- `app/(navigation)/(code)/util/theme-css-variables.ts` - CSS variable theme

### Technical Decisions

- **Playwright over Puppeteer**: Better reliability and cross-platform support
- **Standalone server**: Allows running independently from Next.js app
- **Base64 output**: Universal format for MCP tool responses
- **PNG only**: Simplifies initial implementation (SVG can be added later)

### Out of Scope (per spec)

- Authentication/authorization
- WebSocket or HTTP transport
- Image hosting or URL generation
- SVG output format
- Custom fonts beyond theme defaults
