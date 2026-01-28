/**
 * Frame Renderer
 *
 * Server-side HTML generation for code frame variants.
 * Ports Frame component logic to generate static HTML.
 */

import { Theme, THEMES } from "../shared/themes";
import { renderHighlightedCode } from "./code-renderer";
import { generateHtmlTemplate, cssPropsToInlineStyle } from "./html-template";

/**
 * Options for generating code frame HTML
 */
export interface CodeFrameOptions {
  /**
   * The code to display
   */
  code: string;

  /**
   * Theme ID (e.g., 'vercel', 'supabase')
   */
  theme: string;

  /**
   * Whether to use dark mode
   */
  darkMode: boolean;

  /**
   * Language ID for syntax highlighting
   */
  language: string;

  /**
   * Padding around the frame in pixels
   */
  padding?: number;

  /**
   * Whether to show the background
   */
  background?: boolean;

  /**
   * Whether to show line numbers
   */
  lineNumbers?: boolean;

  /**
   * Filename to display
   */
  fileName?: string;

  /**
   * Lines to highlight (1-indexed)
   */
  highlightedLines?: number[];
}

/**
 * Generates complete HTML for a code frame.
 *
 * @param options - Frame options
 * @returns Complete HTML document string
 */
export async function generateCodeFrameHtml(options: CodeFrameOptions): Promise<string> {
  const {
    code,
    theme: themeId,
    darkMode,
    language,
    padding = 64,
    background = true,
    lineNumbers,
    fileName = "",
    highlightedLines = [],
  } = options;

  // Get theme definition
  const theme = THEMES[themeId] || THEMES.vercel;

  // Determine if line numbers should be shown
  const showLineNumbers = lineNumbers !== undefined ? lineNumbers : (theme.lineNumbers ?? false);

  // Determine theme name for Shiki
  const themeName = themeId === "tailwind" ? (darkMode ? "tailwind-dark" : "tailwind-light") : "css-variables";

  // Render the highlighted code
  const codeHtml = await renderHighlightedCode({
    code,
    language,
    highlightedLines,
    lineNumbers: showLineNumbers,
    themeName,
  });

  // Generate the frame content based on theme
  const frameContent = renderFrame(theme, darkMode, padding, background, fileName, codeHtml, language);

  // Wrap in complete HTML template
  return generateHtmlTemplate({
    content: frameContent,
    theme,
    darkMode,
  });
}

/**
 * Renders the frame based on theme type.
 */
function renderFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
  language: string,
): string {
  const themeId = theme.id;

  switch (themeId) {
    case "vercel":
    case "rabbit":
      return renderVercelFrame(theme, darkMode, padding, background, codeHtml);
    case "supabase":
      return renderSupabaseFrame(theme, darkMode, padding, background, codeHtml);
    case "tailwind":
      return renderTailwindFrame(theme, darkMode, padding, background, codeHtml);
    case "clerk":
      return renderClerkFrame(theme, darkMode, padding, background, codeHtml);
    case "mintlify":
      return renderMintlifyFrame(theme, darkMode, padding, background, fileName, codeHtml);
    case "openai":
      return renderOpenAIFrame(theme, darkMode, padding, background, codeHtml);
    case "triggerdev":
      return renderTriggerdevFrame(theme, darkMode, padding, background, fileName, codeHtml, language);
    case "prisma":
      return renderPrismaFrame(theme, darkMode, padding, background, fileName, codeHtml);
    case "elevenlabs":
      return renderElevenLabsFrame(theme, darkMode, padding, background, codeHtml);
    case "resend":
      return renderResendFrame(theme, darkMode, padding, background, fileName, codeHtml, language);
    case "browserbase":
      return renderBrowserbaseFrame(theme, darkMode, padding, background, fileName, codeHtml);
    case "nuxt":
      return renderNuxtFrame(theme, darkMode, padding, background, codeHtml);
    case "gemini":
      return renderGeminiFrame(theme, darkMode, padding, background, fileName, codeHtml);
    case "wrapped":
      return renderWrappedFrame(theme, darkMode, padding, background, codeHtml);
    case "cloudflare":
      return renderCloudflareFrame(theme, darkMode, padding, background, fileName, codeHtml, language);
    case "stripe":
      return renderStripeFrame(theme, darkMode, padding, background, codeHtml);
    default:
      return renderDefaultFrame(theme, darkMode, padding, background, fileName, codeHtml);
  }
}

/**
 * Gets theme CSS properties as inline styles
 */
function getThemeStyles(theme: Theme, darkMode: boolean): string {
  const syntax = darkMode ? theme.syntax.dark : theme.syntax.light;
  if (!syntax) return "";
  return cssPropsToInlineStyle(syntax);
}

/**
 * Gets frame classes based on options
 */
function getFrameClasses(baseClass: string, darkMode: boolean, background: boolean): string {
  const classes = ["frame", baseClass];
  if (!background) classes.push("noBackground");
  if (darkMode) classes.push("darkMode");
  return classes.join(" ");
}

// ============================================================================
// Theme-specific frame renderers
// ============================================================================

function renderVercelFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "vercelFrame" : "vercelFrame vercelFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="vercelWindow">
        <span class="vercelGridlinesHorizontal" data-grid="true"></span>
        <span class="vercelGridlinesVertical" data-grid="true"></span>
        <span class="vercelBracketLeft" data-grid="true"></span>
        <span class="vercelBracketRight" data-grid="true"></span>
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderSupabaseFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "supabaseFrame" : "supabaseFrame supabaseFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="supabaseWindow">
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderTailwindFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "tailwindFrame" : "tailwindFrame tailwindFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="tailwindWindow">
        ${
          background
            ? `
          <span class="tailwindGridlinesHorizontal" data-grid="true"></span>
          <span class="tailwindGridlinesVertical" data-grid="true"></span>
        `
            : ""
        }
        <div class="tailwindHeader">
          <div class="controls">
            <div class="control"></div>
            <div class="control"></div>
            <div class="control"></div>
          </div>
        </div>
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderClerkFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "clerkFrame" : "clerkFrame clerkFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="clerkWindow">
        <div class="clerkCode">
          ${codeHtml}
        </div>
      </div>
    </div>
  `;
}

function renderMintlifyFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "mintlifyFrame" : "mintlifyFrame mintlifyFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="mintlifyWindow">
        <div class="mintlifyHeader">
          <div class="mintlifyFileName">
            ${fileName || "Untitled-1"}
          </div>
        </div>
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderOpenAIFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "openAIFrame" : "openAIFrame openAIFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; --padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="openAIWindow">
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderTriggerdevFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
  language: string,
): string {
  const frameClass = darkMode ? "triggerFrame" : "triggerFrame triggerFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="triggerWindow">
        <span class="triggerGridlinesHorizontal" data-grid="true"></span>
        <span class="triggerGridlinesVertical" data-grid="true"></span>
        <div class="triggerHeader">
          <div class="triggerFileName">
            ${fileName || "Untitled-1"}
          </div>
          <span class="triggerLanguage">${language}</span>
        </div>
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderPrismaFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "prismaFrame" : "prismaFrame prismaFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="prismaWindow">
        <span data-frameborder></span>
        <span data-frameborder></span>
        <span data-frameborder></span>
        <span data-frameborder></span>
        ${
          fileName
            ? `
          <div class="prismaHeader">
            <div class="prismaFileName">${fileName}</div>
          </div>
        `
            : ""
        }
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderElevenLabsFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "elevenLabsFrame" : "elevenLabsFrame elevenLabsFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="elevenLabsWindow">
        <span class="elevenLabsCircle" style="width: 200px; height: 200px;"></span>
        <span class="elevenLabsGridlineHorizontalTop" data-grid="true"></span>
        <span class="elevenLabsGridlineHorizontalCenter" data-grid="true"></span>
        <span class="elevenLabsGridlineHorizontalBottom" data-grid="true"></span>
        <span class="elevenLabsGridlineVerticalLeft" data-grid="true"></span>
        <span class="elevenLabsGridlineVerticalCenter" data-grid="true"></span>
        <span class="elevenLabsGridlineVerticalRight" data-grid="true"></span>
        <span class="elevenLabsDotTopLeft" data-dot="true"></span>
        <span class="elevenLabsDotTopRight" data-dot="true"></span>
        <span class="elevenLabsDotBottomLeft" data-dot="true"></span>
        <span class="elevenLabsDotBottomRight" data-dot="true"></span>
        <div class="elevenLabsEditor">
          ${codeHtml}
        </div>
      </div>
    </div>
  `;
}

function renderResendFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
  language: string,
): string {
  const classes = ["frame", "resend", darkMode ? "darkMode" : "", background ? "withBackground" : ""]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="resendWindow">
        <div class="resendHeader">
          <div class="resendFileName">
            ${fileName || "Untitled-1"}
          </div>
          <span class="resendLanguage">${language}</span>
        </div>
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderBrowserbaseFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "browserbaseFrame" : "browserbaseFrame browserbaseFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      ${
        background
          ? `
        <div class="browserbaseBackground">
          ${Array(7).fill('<div class="browserbaseBackgroundGridline"></div>').join("")}
        </div>
      `
          : ""
      }
      <div class="browserbaseWindow">
        <div class="header">
          <div class="controls">
            <div class="control"></div>
            <div class="control"></div>
            <div class="control"></div>
          </div>
          <div class="fileName">${fileName || "Untitled-1"}</div>
          <div></div>
        </div>
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderNuxtFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "nuxtFrame" : "nuxtFrame nuxtFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="nuxtWindow">
        <span data-frameborder></span>
        <span data-frameborder></span>
        <span data-frameborder></span>
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderGeminiFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "geminiFrame" : "geminiFrame geminiFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="geminiWindow">
        ${
          fileName
            ? `
          <div class="geminiHeader">
            <div class="geminiFileName">${fileName}</div>
          </div>
        `
            : ""
        }
        <div class="geminiEditor">
          ${codeHtml}
        </div>
      </div>
    </div>
  `;
}

function renderWrappedFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const frameClass = darkMode ? "wrappedFrame" : "wrappedFrame wrappedFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      ${
        background
          ? `
        <span class="wrappedBottomGlow"></span>
        <span class="wrappedBorder"></span>
        <span class="wrappedFade"></span>
        <span class="wrappedGlowLeft"></span>
        <span class="wrappedGlowRight"></span>
        <span class="wrappedGlowBottom"></span>
      `
          : ""
      }
      <div class="wrappedWindow">
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderCloudflareFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
  language: string,
): string {
  const frameClass = darkMode ? "cloudflareFrame" : "cloudflareFrame cloudflareFrameLightMode";
  const classes = background ? `frame ${frameClass}` : `frame ${frameClass} noBackground`;

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="cloudflareWindow">
        <span class="cloudflareGridlinesHorizontal" data-grid="true"></span>
        <span class="cloudflareGridlinesVertical" data-grid="true"></span>
        <div class="cloudflareHeader">
          <div class="cloudflareFileName">${fileName || "Untitled-1"}</div>
          <span class="cloudflareLanguage">${language}</span>
        </div>
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderStripeFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  codeHtml: string,
): string {
  const classes = background ? "frame stripeFrame" : "frame stripeFrame noBackground";

  return `
    <div class="${classes}" style="padding: ${padding}px; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      ${
        background
          ? `
        <div class="stripeBackground">
          <div class="stripeBackgroundGridlineContainer" style="--window-width: 600px;">
            <div class="stripeBackgroundGridline"></div>
            <div class="stripeBackgroundGridline"></div>
            <div class="stripeBackgroundGridline"></div>
            <div class="stripeBackgroundGridline"></div>
            <div class="stripeBackgroundGridline"></div>
          </div>
          <div class="stripeStripe">
            <div class="stripeBackgroundGridlineContainer" style="--window-width: 600px;">
              <div class="stripeBackgroundGridline"></div>
              <div class="stripeBackgroundGridline"></div>
              <div class="stripeBackgroundGridline"></div>
              <div class="stripeBackgroundGridline"></div>
              <div class="stripeBackgroundGridline"></div>
              <div class="stripeSet">
                <div class="stripe1"></div>
                <div class="stripe2"></div>
                <div class="intersection"></div>
              </div>
            </div>
          </div>
        </div>
      `
          : ""
      }
      <div class="stripeWindow">
        ${codeHtml}
      </div>
    </div>
  `;
}

function renderDefaultFrame(
  theme: Theme,
  darkMode: boolean,
  padding: number,
  background: boolean,
  fileName: string,
  codeHtml: string,
): string {
  const themeBackground = background ? `linear-gradient(140deg, ${theme.background.from}, ${theme.background.to})` : "";

  const classes = ["frame", theme.id, darkMode ? "darkMode" : "", background ? "withBackground" : ""]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}" style="padding: ${padding}px; background-image: ${themeBackground}; ${getThemeStyles(theme, darkMode)}">
      ${!background ? '<div class="transparentPattern"></div>' : ""}
      <div class="window withBorder ${background ? "withShadow" : ""}">
        <div class="header">
          <div class="controls">
            <div class="control"></div>
            <div class="control"></div>
            <div class="control"></div>
          </div>
          <div class="fileName">${fileName || "Untitled-1"}</div>
        </div>
        ${codeHtml}
      </div>
    </div>
  `;
}
