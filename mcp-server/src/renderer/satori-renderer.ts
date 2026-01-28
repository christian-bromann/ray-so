/**
 * Satori-based Code Image Renderer
 *
 * Renders code images using Satori (JSX to SVG) and resvg (SVG to PNG).
 * This renderer works without a browser, making it suitable for serverless environments.
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getHighlighter, loadLanguage } from "./highlighter";
import { Theme, THEMES } from "../shared/themes";
import type { ThemedToken } from "shiki";

// Satori element type (simplified React-like structure)
type SatoriElement = {
  type: string;
  props: {
    style?: Record<string, string | number | undefined>;
    children?: SatoriElement | SatoriElement[] | string | (SatoriElement | string)[];
    [key: string]: unknown;
  };
};

/**
 * Helper to create Satori elements without JSX
 */
function h(
  type: string,
  props: Record<string, unknown> | null,
  ...children: (SatoriElement | string | (SatoriElement | string)[])[]
): SatoriElement {
  const flatChildren = children.flat().filter((c) => c !== null && c !== undefined);
  return {
    type,
    props: {
      ...(props || {}),
      children: flatChildren.length === 0 ? undefined : flatChildren.length === 1 ? flatChildren[0] : flatChildren,
    },
  };
}

/**
 * Font data cache for Satori
 */
let fontCache: ArrayBuffer | null = null;

/**
 * Gets the default monospace font for code rendering.
 */
async function getDefaultFont(): Promise<ArrayBuffer> {
  if (fontCache) {
    return fontCache;
  }

  // Fetch JetBrains Mono from Google Fonts CDN
  try {
    const response = await fetch(
      "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff",
    );
    if (response.ok) {
      fontCache = await response.arrayBuffer();
      return fontCache;
    }
  } catch {
    // Fall through to error
  }

  throw new Error("Failed to load font. Please ensure network access is available.");
}

/**
 * Options for rendering a code image
 */
export interface SatoriRenderOptions {
  code: string;
  language: string;
  theme: string;
  darkMode: boolean;
  padding: number;
  background: boolean;
  lineNumbers: boolean;
  fileName: string;
  highlightedLines: number[];
  pixelRatio: number;
}

/**
 * Token color mapping from theme CSS properties
 */
interface TokenColors {
  foreground: string;
  constant: string;
  string: string;
  comment: string;
  keyword: string;
  parameter: string;
  function: string;
  stringExpression: string;
  punctuation: string;
  link: string;
  number: string;
  property: string;
  highlight: string;
  highlightBorder: string;
}

/**
 * Extracts token colors from theme CSS properties
 */
function getTokenColors(theme: Theme, darkMode: boolean): TokenColors {
  const syntax = darkMode ? theme.syntax.dark : theme.syntax.light;
  const fallbackFg = darkMode ? "#ffffff" : "#000000";

  return {
    foreground: syntax?.["--ray-foreground"] || fallbackFg,
    constant: syntax?.["--ray-token-constant"] || fallbackFg,
    string: syntax?.["--ray-token-string"] || fallbackFg,
    comment: syntax?.["--ray-token-comment"] || "#888888",
    keyword: syntax?.["--ray-token-keyword"] || fallbackFg,
    parameter: syntax?.["--ray-token-parameter"] || fallbackFg,
    function: syntax?.["--ray-token-function"] || fallbackFg,
    stringExpression: syntax?.["--ray-token-string-expression"] || fallbackFg,
    punctuation: syntax?.["--ray-token-punctuation"] || fallbackFg,
    link: syntax?.["--ray-token-link"] || fallbackFg,
    number: syntax?.["--ray-token-number"] || fallbackFg,
    property: syntax?.["--ray-token-property"] || fallbackFg,
    highlight: syntax?.["--ray-highlight"] || "rgba(255,255,255,0.1)",
    highlightBorder: syntax?.["--ray-highlight-border"] || "transparent",
  };
}

/**
 * Maps Shiki token to a color
 */
function getTokenColor(token: ThemedToken, colors: TokenColors): string {
  if (token.color) {
    return token.color;
  }

  const scope = (token as { scope?: string }).scope || "";

  if (scope.includes("comment")) return colors.comment;
  if (scope.includes("string")) return colors.string;
  if (scope.includes("keyword")) return colors.keyword;
  if (scope.includes("constant") || scope.includes("number")) return colors.constant;
  if (scope.includes("function")) return colors.function;
  if (scope.includes("variable.parameter")) return colors.parameter;
  if (scope.includes("punctuation")) return colors.punctuation;
  if (scope.includes("property")) return colors.property;

  return colors.foreground;
}

/**
 * Gets tokens from Shiki for the given code
 */
async function getCodeTokens(code: string, language: string, themeName: string): Promise<ThemedToken[][]> {
  const highlighter = await getHighlighter();

  if (language && language !== "plaintext") {
    await loadLanguage(highlighter, language);
  }

  const lang = language === "plaintext" ? "text" : language;

  try {
    // Shiki 1.x API: codeToTokens accepts lang and theme as separate options
    const result = highlighter.codeToTokens(code, {
      lang: lang as "text" | "javascript" | "typescript" | "tsx" | "python" | "json",
      theme: themeName as "css-variables" | "tailwind-dark" | "tailwind-light" | "github-light" | "github-dark",
    });
    return result.tokens;
  } catch {
    return code.split("\n").map((line) => [{ content: line, color: undefined }] as ThemedToken[]);
  }
}

/**
 * Renders a single line of code
 */
function renderCodeLine(
  tokens: ThemedToken[],
  lineNumber: number,
  colors: TokenColors,
  showLineNumbers: boolean,
  isHighlighted: boolean,
): SatoriElement {
  const lineNumberWidth = 40;

  const lineNumberEl = showLineNumbers
    ? h(
        "span",
        {
          style: {
            width: lineNumberWidth,
            flexShrink: 0,
            color: colors.comment,
            opacity: 0.5,
            textAlign: "right",
            paddingRight: 16,
          },
        },
        String(lineNumber),
      )
    : null;

  const tokenElements =
    tokens.length === 0
      ? [h("span", { style: { color: colors.foreground } }, " ")]
      : tokens.map((token, i) =>
          h(
            "span",
            {
              key: i,
              style: {
                color: getTokenColor(token, colors),
                whiteSpace: "pre",
              },
            },
            token.content,
          ),
        );

  const codeContent = h(
    "span",
    {
      style: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      },
    },
    ...tokenElements,
  );

  const children: (SatoriElement | null)[] = [lineNumberEl, codeContent];

  return h(
    "div",
    {
      key: lineNumber,
      style: {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        minHeight: 21,
        backgroundColor: isHighlighted ? colors.highlight : "transparent",
        borderLeft: isHighlighted ? `3px solid ${colors.highlightBorder}` : "3px solid transparent",
        paddingLeft: isHighlighted ? 5 : 8,
        paddingRight: 8,
      },
    },
    ...children.filter((c): c is SatoriElement => c !== null),
  );
}

/**
 * Renders the code editor content
 */
function renderCodeEditor(
  tokenLines: ThemedToken[][],
  colors: TokenColors,
  showLineNumbers: boolean,
  highlightedLines: number[],
): SatoriElement {
  const lines = tokenLines.map((tokens, index) =>
    renderCodeLine(tokens, index + 1, colors, showLineNumbers, highlightedLines.includes(index + 1)),
  );

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        fontFamily: "JetBrains Mono",
        fontSize: 14,
        lineHeight: 1.5,
        padding: "16px 0",
      },
    },
    ...lines,
  );
}

/**
 * Renders the window header
 */
function renderWindowHeader(fileName: string, darkMode: boolean, showControls: boolean): SatoriElement | null {
  if (!fileName && !showControls) {
    return null;
  }

  const textColor = darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
  const borderColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const controls = showControls
    ? h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "row",
            gap: 8,
            marginRight: 12,
          },
        },
        h("div", {
          style: {
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#FF5F57",
          },
        }),
        h("div", {
          style: {
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#FFBD2E",
          },
        }),
        h("div", {
          style: {
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#28CA41",
          },
        }),
      )
    : null;

  const fileNameEl = fileName
    ? h(
        "span",
        {
          style: {
            color: textColor,
            fontSize: 13,
            fontFamily: "sans-serif",
          },
        },
        fileName,
      )
    : null;

  const children: (SatoriElement | null)[] = [controls, fileNameEl];

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: `1px solid ${borderColor}`,
      },
    },
    ...children.filter((c): c is SatoriElement => c !== null),
  );
}

/**
 * Gets background style for the frame
 */
function getBackgroundStyle(theme: Theme, darkMode: boolean, showBackground: boolean): Record<string, string> {
  if (!showBackground) {
    return {
      backgroundColor: darkMode ? "#1a1a1a" : "#f5f5f5",
    };
  }

  return {
    background: `linear-gradient(135deg, ${theme.background.from}, ${theme.background.to})`,
  };
}

/**
 * Gets window styling based on theme
 */
function getWindowStyle(theme: Theme, darkMode: boolean): Record<string, string | number> {
  const baseBg = darkMode ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.9)";
  const borderColor = darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const isVercelLike = ["vercel", "rabbit"].includes(theme.id);

  if (isVercelLike) {
    return {
      backgroundColor: darkMode ? "#000000" : "#ffffff",
      borderRadius: 8,
      border: `1px solid ${borderColor}`,
      overflow: "hidden",
    };
  }

  return {
    backgroundColor: baseBg,
    borderRadius: 12,
    border: `1px solid ${borderColor}`,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    overflow: "hidden",
  };
}

/**
 * Renders the complete code frame
 */
function renderCodeFrame(tokenLines: ThemedToken[][], options: SatoriRenderOptions): SatoriElement {
  const theme = THEMES[options.theme] || THEMES.vercel;
  const colors = getTokenColors(theme, options.darkMode);
  const showLineNumbers = options.lineNumbers ?? theme.lineNumbers ?? false;

  const showControls = !["vercel", "rabbit", "supabase", "openai", "clerk"].includes(theme.id);

  const header = renderWindowHeader(options.fileName, options.darkMode, showControls);
  const codeEditor = renderCodeEditor(tokenLines, colors, showLineNumbers, options.highlightedLines);

  const windowChildren: (SatoriElement | null)[] = [header, codeEditor];

  const window = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        ...getWindowStyle(theme, options.darkMode),
      },
    },
    ...windowChildren.filter((c): c is SatoriElement => c !== null),
  );

  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: options.padding,
        ...getBackgroundStyle(theme, options.darkMode, options.background),
      },
    },
    window,
  );
}

/**
 * Calculates dimensions needed for the code content
 */
function calculateDimensions(code: string, options: SatoriRenderOptions): { width: number; height: number } {
  const lines = code.split("\n");
  const maxLineLength = Math.max(...lines.map((line) => line.length));

  const charWidth = 8.4;
  const lineHeight = 21;

  const lineNumberWidth = options.lineNumbers ? 56 : 0;

  const contentWidth = maxLineLength * charWidth + lineNumberWidth + 32;
  const contentHeight = lines.length * lineHeight + 32;

  const headerHeight = options.fileName ? 45 : 0;
  const framePadding = options.padding * 2;

  const width = Math.max(400, Math.min(1200, contentWidth + framePadding));
  const height = Math.max(200, contentHeight + headerHeight + framePadding);

  return { width, height };
}

/**
 * Renders a code image using Satori and resvg.
 */
export async function renderCodeImageWithSatori(options: SatoriRenderOptions): Promise<Buffer> {
  const fontData = await getDefaultFont();

  const themeName =
    options.theme === "tailwind" ? (options.darkMode ? "tailwind-dark" : "tailwind-light") : "css-variables";

  const tokenLines = await getCodeTokens(options.code, options.language, themeName);

  const { width, height } = calculateDimensions(options.code, options);

  const element = renderCodeFrame(tokenLines, options);

  const svg = await satori(element as unknown as React.ReactNode, {
    width,
    height,
    fonts: [
      {
        name: "JetBrains Mono",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "zoom",
      value: options.pixelRatio,
    },
  });

  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

/**
 * Error class for Satori rendering errors
 */
export class SatoriRenderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "SatoriRenderError";
  }
}
