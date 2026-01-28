/**
 * HTML Template Generator
 *
 * Creates the base HTML template for rendering code frames.
 * Includes font loading, theme CSS variables, and frame styling.
 */

import { Theme, ThemeCSSProperties, Font } from "../shared/themes.js";
import { generateThemeCSSBlock } from "../shared/theme-css.js";

/**
 * Options for generating HTML template
 */
export interface HtmlTemplateOptions {
  /**
   * The inner HTML content to include
   */
  content: string;

  /**
   * The theme to apply
   */
  theme: Theme;

  /**
   * Whether to use dark mode
   */
  darkMode: boolean;

  /**
   * Viewport width for rendering
   */
  viewportWidth?: number;
}

/**
 * Font URL mappings for web fonts
 * These would typically be served from the Next.js app, but for standalone
 * rendering we use public CDN URLs or embed them.
 */
const FONT_URLS: Record<Font, string> = {
  "jetbrains-mono": "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
  "fira-code": "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap",
  "geist-mono": "https://cdn.jsdelivr.net/npm/geist@1.2.0/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  "ibm-plex-mono": "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap",
  "roboto-mono": "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap",
  "source-code-pro": "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap",
  "soehne-mono": "", // Custom font, fallback to system
  "commit-mono": "https://cdn.jsdelivr.net/npm/@fontsource/commit-mono@5.0.1/files/commit-mono-latin-400-normal.woff2",
  "google-sans-code": "", // Custom font, fallback to system
  "space-mono": "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap",
};

/**
 * Font family CSS values
 */
const FONT_FAMILIES: Record<Font, string> = {
  "jetbrains-mono": '"JetBrains Mono", monospace',
  "fira-code": '"Fira Code", monospace',
  "geist-mono": '"Geist Mono", monospace',
  "ibm-plex-mono": '"IBM Plex Mono", monospace',
  "roboto-mono": '"Roboto Mono", monospace',
  "source-code-pro": '"Source Code Pro", monospace',
  "soehne-mono": '"Söhne Mono", "SF Mono", monospace',
  "commit-mono": '"Commit Mono", monospace',
  "google-sans-code": '"Google Sans Mono", monospace',
  "space-mono": '"Space Mono", monospace',
};

/**
 * Generates font-face declarations for custom fonts
 */
function generateFontFaces(font: Font): string {
  const declarations: string[] = [];

  // Add Geist Mono as a custom @font-face if needed
  if (font === "geist-mono") {
    declarations.push(`
      @font-face {
        font-family: 'Geist Mono';
        src: url('${FONT_URLS["geist-mono"]}') format('woff2');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
    `);
  }

  // Add Commit Mono if needed
  if (font === "commit-mono") {
    declarations.push(`
      @font-face {
        font-family: 'Commit Mono';
        src: url('${FONT_URLS["commit-mono"]}') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
    `);
  }

  return declarations.join("\n");
}

/**
 * Generates Google Fonts import link
 */
function generateGoogleFontsImport(font: Font): string {
  const url = FONT_URLS[font];
  if (url && url.includes("fonts.googleapis.com")) {
    return `@import url('${url}');`;
  }
  return "";
}

/**
 * Generates the frame CSS styles
 */
function generateFrameStyles(): string {
  return `
    /* Frame Base Styles */
    .frame {
      transition: padding 200ms;
    }

    .transparentPattern {
      position: absolute;
      z-index: -1;
      background-image: linear-gradient(45deg, #1d1d1d 25%, transparent 0),
        linear-gradient(-45deg, #1d1d1d 25%, transparent 0), 
        linear-gradient(45deg, transparent 75%, #1d1d1d 0),
        linear-gradient(-45deg, transparent 75%, #1d1d1d 0);
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
      background-size: 20px 20px;
      inset: 0;
    }

    .noBackground {
      background: none !important;
    }

    .noBackground [data-grid="true"],
    .noBackground [data-dot="true"] {
      display: none;
    }

    /* Default Window Styles */
    .window {
      display: flex;
      min-height: 100px;
      flex-direction: column;
      align-items: stretch;
      padding-top: 10px;
      border: 1px solid hsl(0 0% 100% / 0.3);
      border-radius: 18px;
      background: var(--frame-background, rgba(0, 0, 0, 0.9));
      transition: all ease 0.3s;
    }

    .window.withBorder {
      border: none;
      box-shadow:
        0 0 0 1px var(--frame-highlight-border, rgba(255,255,255,0.1)),
        0 0 0 1.5px var(--frame-shadow-border, rgba(0,0,0,0.3));
    }

    .window.withShadow {
      border: none;
      box-shadow:
        0 0 0 1px var(--frame-highlight-border, rgba(255,255,255,0.1)),
        0 0 0 1.5px var(--frame-shadow-border, rgba(0,0,0,0.3)),
        0 2.8px 2.2px rgba(0, 0, 0, 0.034),
        0 6.7px 5.3px rgba(0, 0, 0, 0.048),
        0 12.5px 10px rgba(0, 0, 0, 0.06),
        0 22.3px 17.9px rgba(0, 0, 0, 0.072),
        0 41.8px 33.4px rgba(0, 0, 0, 0.086),
        0 100px 80px rgba(0, 0, 0, 0.12);
    }

    .header {
      display: grid;
      height: 24px;
      align-items: center;
      padding: 0 16px;
      grid-gap: 12px;
      grid-template-columns: 60px 1fr 60px;
    }

    .controls {
      display: flex;
      gap: 9px;
    }

    .control {
      width: 14px;
      height: 14px;
      border-radius: 7px;
      background-color: var(--frame-control-color, rgba(255,255,255,0.2));
    }

    .fileName {
      position: relative;
      display: flex;
      height: 16px;
      align-items: center;
      justify-content: center;
      color: var(--frame-title-color, #999);
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.32px;
      line-height: 12px;
      text-align: center;
    }

    /* Vercel Frame */
    .vercelFrame { background: black; }
    .vercelFrameLightMode { background: white; }
    .vercelWindow { position: relative; }
    .vercelGridlinesHorizontal:before,
    .vercelGridlinesHorizontal:after {
      position: absolute;
      top: 0;
      left: -150px;
      width: 1200px;
      height: 1px;
      background: #1a1a1a;
      content: "";
    }
    .vercelGridlinesHorizontal:after { top: auto; bottom: 0; }
    .vercelGridlinesVertical:before,
    .vercelGridlinesVertical:after {
      position: absolute;
      top: -150px;
      left: 0;
      width: 1px;
      height: calc(100% + 300px);
      background: #1a1a1a;
      content: "";
    }
    .vercelGridlinesVertical:after { right: 0; left: auto; }
    .vercelBracketLeft, .vercelBracketRight {
      position: absolute;
      top: -12px;
      left: -12px;
      width: 25px;
      height: 25px;
    }
    .vercelBracketLeft:before, .vercelBracketLeft:after,
    .vercelBracketRight:before, .vercelBracketRight:after {
      position: absolute;
      background: #515356;
      content: "";
    }
    .vercelBracketLeft:before, .vercelBracketRight:before { top: 12px; width: 100%; height: 1px; }
    .vercelBracketLeft:after, .vercelBracketRight:after { left: 12px; width: 1px; height: 100%; }
    .vercelBracketRight { top: auto; right: -12px; bottom: -12px; left: auto; }
    .vercelFrameLightMode .vercelGridlinesHorizontal:before,
    .vercelFrameLightMode .vercelGridlinesHorizontal:after,
    .vercelFrameLightMode .vercelGridlinesVertical:before,
    .vercelFrameLightMode .vercelGridlinesVertical:after { background: #ebebeb; }
    .vercelFrameLightMode .vercelBracketLeft:before,
    .vercelFrameLightMode .vercelBracketLeft:after,
    .vercelFrameLightMode .vercelBracketRight:before,
    .vercelFrameLightMode .vercelBracketRight:after { background: #a8a8a8; }

    /* Supabase Frame */
    .supabaseFrame { background: #121212; }
    .supabaseWindow { border: 1px solid #292929; border-radius: 6px; background: #171717; }
    .supabaseFrameLightMode { background: #fcfcfc; }
    .supabaseFrameLightMode .supabaseWindow { border-color: #dfdfdf; background: #f8f8f8; }

    /* Tailwind Frame */
    .tailwindFrame { position: relative; background: #0f172a; }
    .tailwindWindow { position: relative; z-index: 1; border: 1px solid rgba(210, 241, 255, 0.25); border-radius: 8px; background: rgb(30, 41, 59); }
    .tailwindHeader { height: 34px; padding: 0 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .tailwindHeader .control { width: 10px; height: 10px; background-color: rgb(71, 85, 105); }
    .tailwindFrameLightMode { background: white; }
    .tailwindFrameLightMode .tailwindWindow { background: rgba(255, 255, 255, 0.75); border-color: rgba(15, 23, 42, 0.1); }
    .tailwindFrameLightMode .tailwindHeader { border-color: rgba(0, 0, 0, 0.1); }
    .tailwindFrameLightMode .control { background-color: rgb(226, 232, 240); }
    .tailwindGridlinesHorizontal:before, .tailwindGridlinesHorizontal:after {
      position: absolute; z-index: 2; top: -1.5rem; left: -4rem; width: calc(100% + 8rem); height: 1px;
      background: rgba(255, 255, 255, 0.1); content: "";
    }
    .tailwindGridlinesHorizontal:after { top: auto; bottom: -1.5rem; }
    .tailwindGridlinesVertical:before, .tailwindGridlinesVertical:after {
      position: absolute; z-index: 2; top: -4rem; left: -1.5rem; width: 1px; height: calc(100% + 8rem);
      background: rgba(255, 255, 255, 0.1); content: "";
    }
    .tailwindGridlinesVertical:after { right: -1.5rem; left: auto; }
    .tailwindFrameLightMode .tailwindGridlinesHorizontal:before,
    .tailwindFrameLightMode .tailwindGridlinesHorizontal:after,
    .tailwindFrameLightMode .tailwindGridlinesVertical:before,
    .tailwindFrameLightMode .tailwindGridlinesVertical:after { background: rgba(15, 23, 42, 0.1); }

    /* Clerk Frame */
    .clerkFrame { background: #222222; }
    .clerkWindow { position: relative; padding: 3px; border-radius: 8px; background: #111111;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 1px 0 0 rgba(255, 255, 255, 0.03) inset, 0 0 0 6px rgba(0, 0, 0, 0.08); }
    .clerkCode { border-radius: 5px; background: #191919; --line-number: #484848; }
    .clerkFrameLightMode { background: #f9f9f9; }
    .clerkFrameLightMode .clerkWindow { background: #f8f8f8; }
    .clerkFrameLightMode .clerkCode { background: #ffffff; --line-number: #c9c9c9; }

    /* OpenAI Frame */
    .openAIFrame { --line-number: rgba(255, 255, 255, 0.2); background: #121a29; }
    .openAIWindow { position: relative; z-index: 1; border: 0.5px solid rgba(255, 255, 255, 0.1); border-radius: 8px; background: #232b41; }
    .openAIFrameLightMode { background: linear-gradient(238deg, #f1f0f4 0%, #f8f8fd 100%); --line-number: hsla(240, 12%, 71%, 1); }
    .openAIFrameLightMode .openAIWindow { border: 0.5px solid rgba(0, 0, 0, 0.1); background: #fff; }

    /* Mintlify Frame */
    .mintlifyFrame { background: #121212; }
    .mintlifyWindow { position: relative; z-index: 1; border-radius: 12px; background: #070a08; }
    .mintlifyHeader { display: flex; height: 40px; align-items: center; padding: 0; border-bottom: 1px solid #141818; background: #010201;
      border-top-left-radius: 12px; border-top-right-radius: 12px; }
    .mintlifyFileName { padding: 0 16px; color: #55d799; font-size: 12px; line-height: 40px; }
    .mintlifyFrameLightMode { background: #f6fbf9; }
    .mintlifyFrameLightMode .mintlifyWindow { background: #ffffff; }
    .mintlifyFrameLightMode .mintlifyHeader { border-color: #dfdfdf; background: #fcfcfc; }
    .mintlifyFrameLightMode .mintlifyFileName { color: #0d9373; }

    /* Prisma Frame */
    .prismaFrame { --gradient-angle: 140deg; background: linear-gradient(var(--gradient-angle), #0c1d26 0%, #0a0c17 100%); }
    .prismaWindow { position: relative; border: 1px solid transparent; border-radius: 10px; background-color: hsla(223, 41%, 7%, 75%); }
    .prismaHeader { display: flex; height: 40px; align-items: center; border-radius: 8px 8px 0 0; border-bottom: 1px solid #141818; background: rgba(0, 0, 0, 0.2); }
    .prismaFileName { padding: 0 16px; color: #31baaf; font-size: 12px; line-height: 40px; }
    .prismaFrameLightMode { background: linear-gradient(140deg, #e8e8ff 0%, #e7fefc 100%); }
    .prismaFrameLightMode .prismaWindow { background-color: hsl(193, 72%, 96%, 0.5); }
    .prismaFrameLightMode .prismaHeader { border-color: #dfdfdf; background: hsla(192, 72%, 96%, 0.9); }
    .prismaFrameLightMode .prismaFileName { color: #16a394; }

    /* Trigger.dev Frame */
    .triggerFrame { background: #121317; }
    .triggerWindow { position: relative; background: #121317; }
    .triggerHeader { display: flex; width: 100%; height: 40px; align-items: center; justify-content: space-between; padding: 0 16px;
      background: #16181d; border-top-left-radius: 8px; border-top-right-radius: 8px; gap: 12px; }
    .triggerFileName { color: #b5b8c0; font-size: 14px; line-height: 40px; }
    .triggerLanguage { color: #5f6570; font-size: 14px; line-height: 40px; }
    .triggerGridlinesHorizontal:before, .triggerGridlinesHorizontal:after {
      position: absolute; top: 0; left: -150px; width: 1200px; height: 1px; background: #272a2e; content: ""; }
    .triggerGridlinesHorizontal:after { top: auto; bottom: 0; }
    .triggerGridlinesVertical:before, .triggerGridlinesVertical:after {
      position: absolute; top: -150px; left: 0; width: 1px; height: calc(100% + 300px); background: #272a2e; content: ""; }
    .triggerGridlinesVertical:after { right: 0; left: auto; }
    .triggerFrameLightMode { background: #fafafa; }
    .triggerFrameLightMode .triggerWindow { background: #f5f5f5; }
    .triggerFrameLightMode .triggerHeader { border-bottom: 1px solid #e5e5e5; background: #f8f8f8; }
    .triggerFrameLightMode .triggerFileName { color: #171717; }
    .triggerFrameLightMode .triggerLanguage { color: #707070; }
    .triggerFrameLightMode .triggerGridlinesHorizontal:before, .triggerFrameLightMode .triggerGridlinesHorizontal:after,
    .triggerFrameLightMode .triggerGridlinesVertical:before, .triggerFrameLightMode .triggerGridlinesVertical:after { background: #d9d7d7; }

    /* ElevenLabs Frame */
    .elevenLabsFrame { --background: #111; --border-color: #353535; --dot-color: white; background: var(--background); }
    .elevenLabsFrameLightMode { --background: #fff; --border-color: #e5e7eb; --dot-color: black; }
    .elevenLabsWindow { position: relative; }
    .elevenLabsWindow:before { position: absolute; z-index: 1; width: 100%; height: 100%; border: 1px solid var(--border-color); border-radius: 24px; content: ""; }
    .elevenLabsEditor { position: relative; border-radius: 24px; background: var(--background); }
    .elevenLabsCircle { position: absolute; top: 50%; left: 50%; border: 1px solid var(--border-color); border-radius: 9999px; transform: translate(-50%, -50%); }
    .elevenLabsGridlineHorizontalTop, .elevenLabsGridlineHorizontalCenter, .elevenLabsGridlineHorizontalBottom {
      position: absolute; left: -150px; width: 1200px; height: 1px; background: var(--border-color); }
    .elevenLabsGridlineHorizontalTop { top: 0; }
    .elevenLabsGridlineHorizontalCenter { top: 50%; transform: translateY(-50%); }
    .elevenLabsGridlineHorizontalBottom { bottom: 0; }
    .elevenLabsGridlineVerticalLeft, .elevenLabsGridlineVerticalCenter, .elevenLabsGridlineVerticalRight {
      position: absolute; top: -150px; width: 1px; height: calc(100% + 300px); background: var(--border-color); }
    .elevenLabsGridlineVerticalLeft { left: 0; }
    .elevenLabsGridlineVerticalCenter { left: 50%; transform: translateX(-50%); }
    .elevenLabsGridlineVerticalRight { right: 0; }
    .elevenLabsDotTopLeft, .elevenLabsDotTopRight, .elevenLabsDotBottomLeft, .elevenLabsDotBottomRight {
      position: absolute; z-index: 2; width: 3px; height: 3px; background: var(--dot-color); }
    .elevenLabsDotTopLeft { top: -1px; left: -1px; }
    .elevenLabsDotTopRight { top: -1px; right: -1px; }
    .elevenLabsDotBottomLeft { bottom: -1px; left: -1px; }
    .elevenLabsDotBottomRight { bottom: -1px; right: -1px; }

    /* Resend Frame */
    .resend { --frame-background: hsla(0, 0%, 100%, 0.72); --frame-header-background: hsla(0, 0%, 100%, 0.1); --frame-border: hsla(0, 0%, 24%, 0.13); --frame-text-color: hsl(0, 0%, 0%); }
    .resend.darkMode { --frame-background: hsla(0, 0%, 0%, 0.88); --frame-header-background: hsla(0, 0%, 0%, 0.9); --frame-text-color: hsl(0, 0%, 98%); }
    .resendWindow { position: relative; z-index: 1; border: 0.5px solid var(--frame-border); border-radius: 8px; background: var(--frame-background); }
    .resendHeader { display: flex; height: 40px; align-items: center; justify-content: space-between; padding: 0 16px;
      border-bottom: 1px solid var(--frame-border); background: var(--frame-header-background);
      border-top-left-radius: 7.5px; border-top-right-radius: 7.5px; gap: 12px; }
    .resendFileName { color: var(--frame-text-color); font-size: 14px; line-height: 40px; }
    .resendLanguage { color: #898989; font-size: 14px; line-height: 40px; }

    /* Browserbase Frame */
    .browserbaseFrame { position: relative; background-color: hsla(0, 0%, 3%, 100%); }
    .browserbaseBackground { position: absolute; z-index: 0; top: 0; left: 0; width: 100%; height: 100%; }
    .browserbaseBackgroundGridline { position: absolute; width: 1px; height: 100%; border-left: 2px dashed rgba(255, 255, 255, 0.1); }
    .browserbaseBackgroundGridline:nth-child(1) { left: 5%; }
    .browserbaseBackgroundGridline:nth-child(2) { left: 20%; }
    .browserbaseBackgroundGridline:nth-child(3) { left: 35%; }
    .browserbaseBackgroundGridline:nth-child(4) { left: 50%; }
    .browserbaseBackgroundGridline:nth-child(5) { left: 65%; }
    .browserbaseBackgroundGridline:nth-child(6) { left: 80%; }
    .browserbaseBackgroundGridline:nth-child(7) { left: 95%; }
    .browserbaseWindow { position: relative; z-index: 1; border: 2px solid rgba(255, 255, 255, 0.1); background: hsla(0, 0%, 6%, 100%); }
    .browserbaseWindow .header { height: 30px; padding-top: 10px; }
    .browserbaseWindow .fileName { height: 24px; font-size: 14px; line-height: 24px; }
    .browserbaseFrameLightMode { background: hsla(21.572, 35.722%, 96.76%); }
    .browserbaseFrameLightMode .browserbaseWindow { border-color: rgba(0, 0, 0, 0.3); background: #fff; }
    .browserbaseFrameLightMode .browserbaseBackgroundGridline { border-color: rgba(0, 0, 0, 0.3); }

    /* Nuxt Frame */
    .nuxtFrame { position: relative; background: #0b0c11; }
    .nuxtWindow { position: relative; z-index: 1; border-radius: 10px; background-color: #0b0c11; --line-number: #8b949e; }
    .nuxtFrameLightMode { background: linear-gradient(140deg, #f8faf9 0%, #f0f9f4 100%); }
    .nuxtFrameLightMode .nuxtWindow { background-color: transparent; --line-number: #78909c; }

    /* Gemini Frame */
    .geminiFrame { position: relative; overflow: hidden; background: #0e1016; }
    .geminiWindow { position: relative; z-index: 10; display: flex; overflow: hidden; min-height: 100px;
      flex-direction: column; border-radius: 26px; background: #16181d; }
    .geminiHeader { display: flex; height: 40px; align-items: center; background: rgba(0, 0, 0, 0.2); }
    .geminiFileName { margin: 0 16px; color: #5c9ec7; font-size: 12px; line-height: 40px; }
    .geminiEditor { }
    .geminiFrameLightMode .geminiWindow { background: rgba(255, 255, 255, 0.9); }
    .geminiFrameLightMode .geminiFileName { color: #1867d2; }
    .geminiFrameLightMode .geminiHeader { background: rgba(0, 0, 0, 0.03); }

    /* Wrapped Frame */
    .wrappedFrame { --wrapped-bg: #0a0a0a; position: relative; background-color: var(--wrapped-bg); }
    .wrappedWindow { position: relative; z-index: 4; }
    .wrappedBorder { position: absolute; z-index: 2; border: 1px solid #a25f21; inset: 0; }
    .wrappedGlowLeft, .wrappedGlowRight { position: absolute; z-index: 1; top: 0; bottom: 0; width: 60px; }
    .wrappedGlowLeft { left: 0; background: linear-gradient(to right, rgba(251, 146, 60, 0.15) 0%, transparent 100%); }
    .wrappedGlowRight { right: 0; background: linear-gradient(to left, rgba(251, 146, 60, 0.15) 0%, transparent 100%); }
    .wrappedGlowBottom { position: absolute; z-index: 1; right: 0; bottom: 0; left: 0; height: 80px;
      background: linear-gradient(to top, rgba(251, 146, 60, 0.2) 0%, transparent 100%); }
    .wrappedFade { position: absolute; z-index: 3; background: linear-gradient(to bottom, var(--wrapped-bg) 0%, transparent 100%); inset: 0; }
    .wrappedBottomGlow { position: absolute; z-index: 0; bottom: 0; left: 0; right: 0; height: 150px;
      background: radial-gradient(ellipse 50% 100% at center bottom, rgba(162, 95, 33, 0.5) 0%, transparent 80%); }
    .wrappedFrameLightMode { --wrapped-bg: #fafaf9; }

    /* Cloudflare Frame */
    .cloudflareFrame { background: #0c0c0c; }
    .cloudflareWindow { position: relative; border: none; border-radius: 0; background: #0c0c0c; }
    .cloudflareGridlinesHorizontal:before, .cloudflareGridlinesHorizontal:after {
      position: absolute; top: 0; left: -150px; width: 1200px; height: 1px; background: #262626; content: ""; }
    .cloudflareGridlinesHorizontal:after { top: auto; bottom: 0; }
    .cloudflareGridlinesVertical:before, .cloudflareGridlinesVertical:after {
      position: absolute; top: -150px; left: 0; width: 1px; height: calc(100% + 300px); background: #262626; content: ""; }
    .cloudflareGridlinesVertical:after { right: 0; left: auto; }
    .cloudflareHeader { display: flex; width: 100%; height: 40px; align-items: center; justify-content: space-between; padding: 0 16px;
      border-bottom: 1px solid #262626; background: #0f0f0f; gap: 12px; }
    .cloudflareFileName { color: #ededed; font-size: 14px; line-height: 40px; }
    .cloudflareLanguage { color: #737373; font-size: 14px; line-height: 40px; }
    .cloudflareFrameLightMode { background: #f5f5f5; }
    .cloudflareFrameLightMode .cloudflareWindow { border-color: #e5e5e5; background: #ffffff; }
    .cloudflareFrameLightMode .cloudflareHeader { border-color: #e5e5e5; background: #fafafa; }
    .cloudflareFrameLightMode .cloudflareFileName { color: oklch(14.5% 0 0); }
    .cloudflareFrameLightMode .cloudflareLanguage { color: oklch(70.8% 0 0); }
    .cloudflareFrameLightMode .cloudflareGridlinesHorizontal:before, .cloudflareFrameLightMode .cloudflareGridlinesHorizontal:after,
    .cloudflareFrameLightMode .cloudflareGridlinesVertical:before, .cloudflareFrameLightMode .cloudflareGridlinesVertical:after { background: #e5e5e5; }

    /* Stripe Frame */
    .stripeFrame { --bg: #0a2540; --stripe: hsla(213.69, 52%, 97.828%); --border: #0f395e; --gridline: rgba(255, 255, 255, 0.1);
      --window: #0c2e4e; --line-number: #55718d; position: relative; background-color: var(--bg); }
    .stripeBackground { position: absolute; z-index: 0; top: 0; left: 0; width: 100%; height: 100%; }
    .stripeBackgroundGridlineContainer { position: relative; width: var(--window-width); height: 100%; margin: 0 auto; }
    .stripeBackgroundGridline { position: absolute; z-index: 1; width: 1px; height: 100%; border-left: 1px dashed var(--gridline); }
    .stripeBackgroundGridline:nth-child(1) { left: 0; border-style: solid; }
    .stripeBackgroundGridline:nth-child(2) { left: 25%; }
    .stripeBackgroundGridline:nth-child(3) { left: 50%; }
    .stripeBackgroundGridline:nth-child(4) { left: 75%; }
    .stripeBackgroundGridline:nth-child(5) { left: calc(100% - 1px); border-style: solid; }
    .stripeWindow { position: relative; z-index: 1; border: 1px solid var(--border); border-radius: 8px; background: var(--window);
      box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px; }
    .stripeStripe { position: absolute; z-index: 0; top: 60%; left: 0; width: 100%; height: 40%;
      background: var(--stripe); transform: skewY(-6deg); transform-origin: 100% 0; --gridline: rgba(66, 71, 112, 0.15); }
    .stripeSet { position: absolute; z-index: 1; bottom: 65px; left: calc(var(--window-width) * 0.75 - 50px); width: 500px; height: 50px; }
    .stripe1 { position: absolute; width: 100%; height: 100%; background: rgb(17, 239, 227); }
    .stripe2 { position: absolute; width: 100%; height: 32px; background: rgb(153, 102, 255); transform: translate(50px, 50px); }
    .intersection { position: absolute; width: 100%; height: 18px; background: hsla(221.1, 99.822%, 44.876%); transform: translate(50px, 32px); }

    /* Theme Backgrounds */
    .withBackground { background-size: cover; background-position: center; }
    .bitmap.withBackground { background-color: black; }
    .noir.withBackground { background-size: cover; }
    .ice.withBackground { background-color: #f6f6f6; }
    .ice.darkMode.withBackground { background-color: #0e0e0e; }
  `;
}

/**
 * Generates the base CSS styles for the code editor
 */
function generateEditorStyles(): string {
  return `
    .editor {
      display: grid;
      width: 100%;
      min-height: 0;
      grid-template: auto / 1fr;
    }

    .editor .line {
      display: inline-block;
      width: calc(100% + 32px);
      padding: 0 16px;
      margin: 0 -16px;
    }

    .editor .line:before {
      position: relative;
      left: 6px;
      display: inline-block;
      width: 1rem;
      margin-right: 1.5rem;
      margin-left: -2.5rem;
      color: var(--line-number, #666);
      content: attr(data-line);
      opacity: 0;
      text-align: right;
    }

    .showLineNumbers .line:before {
      opacity: 1;
    }

    .showLineNumbers .formatted,
    .showLineNumbers .editor:after {
      padding-left: 3rem;
    }

    .showLineNumbers .line {
      width: calc(100% + 16px + 3rem);
      padding: 0 16px 0 3rem;
      margin: 0 -16px 0 -3rem;
    }

    .showLineNumbersLarge .formatted,
    .showLineNumbersLarge .editor:after {
      padding-left: 3.5rem;
    }

    .showLineNumbersLarge .line {
      width: calc(100% + 16px + 3.5rem);
      padding: 0 16px 0 3.5rem;
      margin: 0 -16px 0 -3.5rem;
    }

    .formatted {
      padding: 16px;
      margin: 0;
      font-family: inherit;
      font-size: 15px;
      font-variant-ligatures: none;
      font-weight: inherit;
      letter-spacing: 0.1px;
      line-height: 22.5px;
      tab-size: 2;
      white-space: pre-wrap;
    }

    .formatted > pre {
      margin: 0;
      background-color: initial !important;
      font-family: inherit;
      white-space: pre-wrap;
    }

    .formatted > pre > code {
      font-family: inherit;
    }

    .plainText {
      color: var(--ray-foreground);
    }

    .highlighted-line {
      position: relative;
      background-color: var(--ray-highlight) !important;
    }

    .highlighted-line:after {
      position: absolute;
      top: 0;
      bottom: 0;
      left: -1px;
      width: 2px;
      background-color: var(--ray-highlight-border);
      content: "";
    }
  `;
}

/**
 * Generates the complete HTML template
 */
export function generateHtmlTemplate(options: HtmlTemplateOptions): string {
  const { content, theme, darkMode, viewportWidth = 800 } = options;

  // Get theme syntax CSS
  const themeSyntax = darkMode ? theme.syntax.dark : theme.syntax.light;
  const themeCss = themeSyntax ? generateThemeCSSBlock(themeSyntax) : "";

  // Get font settings
  const font = theme.font || "jetbrains-mono";
  const fontFamily = FONT_FAMILIES[font];
  const fontFaces = generateFontFaces(font);
  const googleFontsImport = generateGoogleFontsImport(font);

  // Generate editor styles
  const editorStyles = generateEditorStyles();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Frame</title>
  <style>
    ${googleFontsImport}
    ${fontFaces}
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      width: ${viewportWidth}px;
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    body {
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    
    /* Theme CSS Variables */
    :root {
      ${themeCss}
      --line-number: ${getLineNumberColor(theme, darkMode)};
    }
    
    /* Frame Styles */
    ${generateFrameStyles()}
    
    /* Editor Styles */
    ${editorStyles}
    
    /* Frame Container */
    .frame-container {
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="frame-container">
    ${content}
  </div>
</body>
</html>`;
}

/**
 * Gets the line number color for a theme
 */
function getLineNumberColor(theme: Theme, darkMode: boolean): string {
  // Theme-specific line number colors
  const lineNumberColors: Record<string, { dark: string; light: string }> = {
    vercel: { dark: "#666", light: "#999" },
    supabase: { dark: "#555", light: "#aaa" },
    tailwind: { dark: "#64748b", light: "#94a3b8" },
    openai: { dark: "rgba(255,255,255,0.2)", light: "hsla(240, 12%, 71%, 1)" },
    clerk: { dark: "#484848", light: "#c9c9c9" },
    mintlify: { dark: "#555", light: "#999" },
    prisma: { dark: "#555", light: "#999" },
    elevenlabs: { dark: "#555", light: "#999" },
    triggerdev: { dark: "#5f6570", light: "#707070" },
    nuxt: { dark: "#8b949e", light: "#78909c" },
    browserbase: { dark: "#555", light: "#999" },
    gemini: { dark: "#555", light: "#999" },
    stripe: { dark: "#55718d", light: "#6b7280" },
    cloudflare: { dark: "#737373", light: "#737373" },
    resend: { dark: "#666", light: "#999" },
    wrapped: { dark: "#666", light: "#999" },
  };

  const colors = lineNumberColors[theme.id] || { dark: "#666", light: "#999" };
  return darkMode ? colors.dark : colors.light;
}

/**
 * Generates inline style string from CSS properties
 */
export function cssPropsToInlineStyle(props: ThemeCSSProperties): string {
  return Object.entries(props)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}
