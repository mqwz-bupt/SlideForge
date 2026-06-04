// Design Token System — extracted from frontend-slides bold-template-pack
// Each theme is a full design system, not just a color swap.

// ── Color Tokens ──────────────────────────────────────────────────────────

export interface ColorTokens {
  /** Primary background */
  bg: string
  /** Primary accent — the signature color */
  primary: string
  /** Main text color */
  text: string
  /** Secondary/muted text */
  textMuted: string
  /** Tertiary/light text */
  textLight: string
  /** Accent at low opacity (tag pills, bar tracks) */
  accentLight: string
  /** Accent at medium opacity */
  accentMedium: string
  /** Border color — usually accent at ~20% opacity */
  border: string
  /** Card background — usually accent at ~4% opacity */
  cardBg: string
  /** Positive indicator (inline only) */
  positive?: string
  /** Negative indicator (inline only) */
  negative?: string
}

// ── Typography Tokens ─────────────────────────────────────────────────────

export interface TypeScaleToken {
  fontFamily: string
  fontWeight: number
  fontSize: string
  lineHeight: number
  letterSpacing?: string
  textTransform?: 'uppercase' | 'none'
}

export interface TypographyTokens {
  h1: TypeScaleToken
  h2: TypeScaleToken
  h3: TypeScaleToken
  h4Eyebrow: TypeScaleToken
  body: TypeScaleToken
  metricValue: TypeScaleToken
  metricLabel: TypeScaleToken
  statNum: TypeScaleToken
  blockquote: TypeScaleToken
  tag: TypeScaleToken
}

// ── Spacing Tokens ────────────────────────────────────────────────────────

export interface SpacingTokens {
  padSlideX: string
  padSlideYTop: string
  padSlideYBottom: string
  padCardLg: string
  padCardMd: string
  gapGridLg: string
  gapGridMd: string
  gapCards: string
  headerMargin: string
}

// ── Radii Tokens ──────────────────────────────────────────────────────────

export interface RadiiTokens {
  pill: string
  cardLg: string
  cardMd: string
  cardSm: string
  bar: string
}

// ── Component Tokens ──────────────────────────────────────────────────────

export interface ComponentTokens {
  cardTinted: {
    background: string
    border: string
    borderRadius: string
    padding: string
  }
  tagPill: {
    background: string
    color: string
    padding: string
    borderRadius: string
    fontSize: string
  }
  accentLine: {
    width: string
    height: string
    background: string
    borderRadius: string
  }
  coverDecoration?: {
    background: string
    clipPath: string
  }
}

// ── Decorative Element Types ──────────────────────────────────────────────

export type DecorativeStyle =
  | 'none'
  | 'tinted-cards'     // Blue Professional: soft accent-tinted bg + translucent borders
  | 'color-split'      // Coral: multi-surface region splits at hard edges
  | 'type-as-mass'     // Studio: oversized type as primary visual element
  | 'hairline-rules'   // Editorial Forest: thin 2px rules, generous padding
  | 'dot-grid'         // Swiss Modern: geometric dot patterns
  | 'diagonal-hatch'   // Coral: 45° diagonal hatch pattern at low opacity
  | 'oversized-numeral' // Coral/Studio: decorative large numerals at low opacity
  | 'neon-glow'        // Neon Cyber: glowing accent with text-shadow
  | 'terminal-scan'    // Terminal Green: scanline effect

// ── Theme Metadata ────────────────────────────────────────────────────────

export type ContentFormality = 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high'
export type ColorScheme = 'light' | 'dark' | 'mixed'
export type ContentDensity = 'low' | 'medium' | 'high'

export type ContentType = 'academic' | 'business' | 'creative' | 'technical'

export interface ThemeMetadata {
  /** Human-readable theme name */
  label: string
  /** Short tagline */
  tagline: string
  /** Mood keywords for matching */
  mood: string[]
  /** Tone keywords */
  tone: string[]
  /** Formality level */
  formality: ContentFormality
  /** Content density */
  density: ContentDensity
  /** Light/dark/mixed scheme */
  scheme: ColorScheme
  /** Best suited content types */
  bestFor: ContentType[]
  /** Themes to avoid for these content types */
  avoidFor?: ContentType[]
}

// ── CJK Font Pairing ──────────────────────────────────────────────────────

export interface CJKFontPairing {
  /** CJK font for display/headline role */
  displayFont: string
  /** CJK font for body role */
  bodyFont: string
  /** Google Fonts URL for CJK fonts */
  fontsUrl: string
  /** Line-height bump multiplier for CJK (e.g., 1.15 = +15%) */
  lineHeightBump: number
}

// ── Complete Design Token ─────────────────────────────────────────────────

export interface DesignTokens {
  /** Unique slug identifier */
  slug: string
  /** Legacy compatibility — Google Fonts URL */
  fontsUrl: string
  /** Display font family (Latin) */
  displayFont: string
  /** Body font family (Latin) */
  bodyFont: string
  /** Color tokens */
  colors: ColorTokens
  /** Typography scale */
  typography: TypographyTokens
  /** Spacing scale */
  spacing: SpacingTokens
  /** Border radii */
  radii: RadiiTokens
  /** Component patterns */
  components: ComponentTokens
  /** Decorative style strategy */
  decorativeStyle: DecorativeStyle
  /** Theme metadata for intelligent matching */
  meta: ThemeMetadata
  /** CJK font pairing for Chinese content */
  cjk: CJKFontPairing
}

// ── Color Contrast Result ─────────────────────────────────────────────────

export interface ContrastResult {
  ratio: number
  aa: boolean
  aaLarge: boolean
  aaa: boolean
  aaaLarge: boolean
}

// ── Theme Recommendation ──────────────────────────────────────────────────

export interface ThemeRecommendation {
  slug: string
  score: number
  reason: string
}
