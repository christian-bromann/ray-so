# Ray.so Code Image MCP Server

An MCP (Model Context Protocol) server that enables AI assistants to generate beautiful code images/screenshots using [ray.so](https://ray.so) themes and styling.

## Features

- **20+ Beautiful Themes**: Vercel, Supabase, Tailwind, OpenAI, and more
- **45+ Languages**: Syntax highlighting for all major programming languages
- **Customizable**: Padding, backgrounds, line numbers, file names, and highlighted lines
- **High Resolution**: Support for 2x, 4x, and 6x export sizes
- **Auto-Detection**: Automatic language detection when not specified

## Installation

### Using npx (Recommended)

No installation required. Configure your MCP client to use:

```bash
npx ray-so-mcp-server
```

### Global Installation

```bash
npm install -g ray-so-mcp-server
```

Then run:

```bash
ray-so-mcp
```

### Local Installation

```bash
npm install ray-so-mcp-server
```

## Configuration

### Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ray-so-code-image": {
      "command": "npx",
      "args": ["-y", "ray-so-mcp-server"]
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json` or global settings):

```json
{
  "mcpServers": {
    "ray-so-code-image": {
      "command": "npx",
      "args": ["-y", "ray-so-mcp-server"]
    }
  }
}
```

### Using Node Directly

If you have the package installed locally or globally:

```json
{
  "mcpServers": {
    "ray-so-code-image": {
      "command": "node",
      "args": ["/path/to/ray-so-mcp-server/bin/ray-code-image.js"]
    }
  }
}
```

## Available Tools

### `list_themes`

Lists all available themes for code image generation.

**Parameters**: None

**Returns**: Array of theme objects with the following properties:

- `id` (string): Unique theme identifier
- `name` (string): Display name of the theme
- `hasDarkMode` (boolean): Whether the theme supports dark mode
- `hasLightMode` (boolean): Whether the theme supports light mode
- `isPartner` (boolean): Whether this is a partner/branded theme

**Example Response**:

```json
[
  {
    "id": "vercel",
    "name": "Vercel",
    "hasDarkMode": true,
    "hasLightMode": true,
    "isPartner": true
  },
  {
    "id": "supabase",
    "name": "Supabase",
    "hasDarkMode": true,
    "hasLightMode": false,
    "isPartner": true
  }
]
```

### `list_languages`

Lists all available programming languages for syntax highlighting.

**Parameters**: None

**Returns**: Array of language objects with the following properties:

- `id` (string): Language identifier (use with `create_code_image`)
- `name` (string): Display name of the language

**Example Response**:

```json
[
  { "id": "javascript", "name": "JavaScript" },
  { "id": "typescript", "name": "TypeScript" },
  { "id": "python", "name": "Python" }
]
```

### `create_code_image`

Generates a beautiful code image from a code snippet.

**Parameters**:

| Parameter          | Type     | Required | Default     | Description                                                                       |
| ------------------ | -------- | -------- | ----------- | --------------------------------------------------------------------------------- |
| `code`             | string   | Yes      | -           | The code to render as an image                                                    |
| `language`         | string   | No       | auto-detect | Programming language for syntax highlighting. Use `list_languages` to see options |
| `theme`            | string   | No       | `"vercel"`  | Theme ID for styling. Use `list_themes` to see options                            |
| `darkMode`         | boolean  | No       | `true`      | Use dark mode variant of the theme                                                |
| `padding`          | number   | No       | `64`        | Padding around the code frame. Valid values: `16`, `32`, `64`, `128`              |
| `background`       | boolean  | No       | `true`      | Show theme background gradient                                                    |
| `lineNumbers`      | boolean  | No       | `false`     | Show line numbers                                                                 |
| `fileName`         | string   | No       | -           | Filename to display in the frame header                                           |
| `highlightedLines` | number[] | No       | -           | Line numbers to highlight (1-indexed)                                             |
| `exportSize`       | number   | No       | `2`         | Export size / pixel ratio. Valid values: `2` (1x), `4` (2x), `6` (3x)             |

**Returns**:

- On success: Base64-encoded PNG image data
- On error: Error object with `error` message and `errorCode`

**Example Usage**:

```typescript
// Basic usage
create_code_image({
  code: "console.log('Hello, World!');",
});

// With all options
create_code_image({
  code: `function greet(name: string) {
  return \`Hello, \${name}!\`;
}`,
  language: "typescript",
  theme: "supabase",
  darkMode: true,
  padding: 64,
  background: true,
  lineNumbers: true,
  fileName: "greet.ts",
  highlightedLines: [2],
  exportSize: 4,
});
```

**Error Codes**:

| Code                        | Description                                  |
| --------------------------- | -------------------------------------------- |
| `INVALID_CODE`              | Code parameter is empty or invalid           |
| `INVALID_THEME`             | Theme ID does not exist                      |
| `INVALID_LANGUAGE`          | Language ID does not exist                   |
| `INVALID_PADDING`           | Padding value is not one of: 16, 32, 64, 128 |
| `INVALID_EXPORT_SIZE`       | Export size is not one of: 2, 4, 6           |
| `INVALID_HIGHLIGHTED_LINES` | Highlighted lines contain invalid values     |
| `TIMEOUT`                   | Image generation exceeded 30 second timeout  |
| `GENERATION_FAILED`         | General rendering error                      |

## Available Themes

Partner themes (appear first):

- `vercel` - Vercel
- `supabase` - Supabase
- `tailwind` - Tailwind CSS
- `openai` - OpenAI
- `clerk` - Clerk
- `bitmap` - Bitmap

Standard themes:

- `breeze` - Breeze
- `candy` - Candy
- `crimson` - Crimson
- `falcon` - Falcon
- `meadow` - Meadow
- `midnight` - Midnight
- `mono` - Mono
- `noir` - Noir
- `ocean` - Ocean
- `sand` - Sand
- `sunset` - Sunset
- And more...

Use `list_themes` to get the complete, up-to-date list.

## Requirements

- Node.js 22 or later
- Playwright-compatible browser (Chromium) - automatically managed

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the server
npm start

# Run tests
npm test
```

## License

MIT
