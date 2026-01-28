# Specification: MCP Integration for Code Image Generation

## Goal

Enable AI assistants to programmatically generate beautiful code images/screenshots via MCP (Model Context Protocol) tools, exposing the full customization options available in the ray.so UI without requiring manual interaction.

## User Stories

- As an AI assistant user, I want to generate code images through MCP tools so that I can quickly create shareable code screenshots without leaving my workflow
- As a developer integrating with AI tools, I want to list available themes and languages so that I can customize the generated images to match my preferences

## Specific Requirements

**MCP Server Setup**

- Create standalone MCP server runnable as a separate Node.js process
- Support stdio transport for local MCP connections
- Package as a separate entry point (e.g., `mcp-server.ts`) that can be invoked via `npx` or direct node execution
- Server startup time must be under 2 seconds
- Export MCP server configuration for easy integration with Claude, Cursor, etc.

**`create_code_image` Tool**

- Accept code content as required string input
- Accept optional language parameter (auto-detect if not provided using highlight.js)
- Accept optional theme parameter (default to "vercel")
- Accept optional darkMode boolean (default true)
- Accept optional padding number: 16, 32, 64, or 128 (default 64)
- Accept optional background boolean (default true)
- Accept optional lineNumbers boolean (default false)
- Accept optional fileName string for window title
- Accept optional highlightedLines array of line numbers to highlight
- Accept optional exportSize: 2, 4, or 6 (default 2)
- Return base64-encoded PNG image data

**`list_themes` Tool**

- Return array of available theme objects
- Each theme object includes: id, name, hasDarkMode, hasLightMode, isPartner
- Filter out hidden themes (e.g., "rabbit")
- Sort partner themes first, then alphabetically

**`list_languages` Tool**

- Return array of supported language objects
- Each language object includes: id, name
- Sort alphabetically by display name

**Server-Side Rendering**

- Use Playwright for headless browser rendering (preferred over Puppeteer for reliability)
- Render the Frame component server-side with all theme/styling applied
- Apply Shiki syntax highlighting with theme-specific CSS variables
- Generate PNG at specified export size (2x, 4x, 6x pixel ratio)
- Support code snippets up to 500 lines
- Complete image generation within 5 seconds for typical snippets

**Configuration & Defaults**

- Theme: "vercel" default
- Language: auto-detect via highlight.js if not specified
- Padding: 64px default
- Dark mode: true default
- Background: true default
- Line numbers: false (unless theme specifies otherwise)
- Export size: 2x default

**Error Handling**

- Return clear error messages for invalid theme/language IDs
- Handle empty or missing code input gracefully
- Timeout image generation after 30 seconds with appropriate error

## Existing Code to Leverage

**Theme Definitions (`store/themes.ts`)**

- `THEMES` object contains 24+ theme definitions with id, name, background colors, syntax highlighting
- Each theme has `syntax.light` and/or `syntax.dark` CSS properties for Shiki
- Theme type includes `partner`, `hidden`, `lineNumbers`, `font` properties
- `convertToShikiTheme()` function transforms syntax objects to CSS variable format
- Export theme IDs directly from this module for the `list_themes` tool

**Language Definitions (`util/languages.ts`)**

- `LANGUAGES` object maps language IDs to names and Shiki import sources
- Contains 45+ languages (javascript, typescript, python, rust, go, etc.)
- Each language has `name` (display) and `src` (dynamic Shiki import)
- Can extract id/name pairs directly for the `list_languages` tool

**Syntax Highlighting (`components/HighlightedCode.tsx`, `util/theme-css-variables.ts`)**

- Uses Shiki highlighter with custom CSS variables theme
- `createCssVariablesTheme()` creates theme with `--ray-` variable prefix
- Theme CSS applied via inline styles from `themeCSSAtom`
- Language detection uses highlight.js in `store/code.ts` via `detectLanguage()`

**Image Export Logic (`lib/image.ts`, `components/ExportButton.tsx`)**

- `toPng()`, `toSvg()`, `toBlob()` wrappers around html-to-image library
- Double-render workaround for html-to-image reliability issue
- `pixelRatio` option controls export resolution (2, 4, 6)
- `imageFilter` excludes textarea and elements with `data-ignore-in-export`

**State/Configuration Options (`store/` directory)**

- `paddingAtom`: values 16, 32, 64, 128 in `store/padding.ts`
- `exportSizeAtom`: values 2, 4, 6 in `store/image.ts`
- `showBackgroundAtom`, `showLineNumbersAtom`, `fileNameAtom`, `highlightedLinesAtom` in `store/index.ts`
- `darkModeAtom`, `themeAtom` in `store/themes.ts`
- `codeAtom`, `selectedLanguageAtom` in `store/code.ts`

## Out of Scope

- Real-time preview or streaming of image generation progress
- Authentication or authorization for the MCP server
- Image hosting, URL generation, or CDN integration
- Video or animated GIF output
- Generating multiple images in a single MCP request
- SVG output format (PNG only for initial implementation)
- Custom font uploads or font configuration beyond theme defaults
- Custom color/syntax highlighting beyond existing themes
- WebSocket or HTTP transport (stdio only for initial implementation)
- Rate limiting or request queuing
