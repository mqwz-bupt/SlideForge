// Color utility module — WCAG contrast checking + color harmony + theme matching
// This file is imported by stylePresets.ts and the theme recommendation engine.

import type {
  ContrastResult,
  ContentType,
  ThemeRecommendation,
  DesignTokens,
  ContentFormality,
  ColorScheme,
} from '@/shared/types/designTokens'

// ── WCAG Color Contrast ───────────────────────────────────────────────────

/** Parse any CSS color string to {r, g, b} (0-255). Supports #hex, rgb(), rgba(). */
export function parseColor(css: string): { r: number; g: number; b: number } | null {
  const hex6 = css.match(/#([0-9a-fA-F]{6})/)
  if (hex6) {
    const h = hex6[1]
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
  }
  const hex3 = css.match(/#([0-9a-fA-F]{3})(?![0-9a-fA-F])/)
  if (hex3) {
    const h = hex3[1]
    return { r: parseInt(h[0] + h[0], 16), g: parseInt(h[1] + h[1], 16), b: parseInt(h[2] + h[2], 16) }
  }
  const rgb = css.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgb) {
    return { r: parseInt(rgb[1]), g: parseInt(rgb[2]), b: parseInt(rgb[3]) }
  }
  return null
}

/** Extract first solid hex color from a possibly-gradient CSS value */
export function extractSolidColor(cssValue: string): string {
  const m6 = cssValue.match(/#[0-9a-fA-F]{6}/)
  if (m6) return m6[0]
  const m3 = cssValue.match(/#([0-9a-fA-F]{3})(?![0-9a-fA-F])/)
  if (m3) {
    const h = m3[1]
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
  }
  return '#333333'
}

/** Relative luminance per WCAG 2.1 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/** Contrast ratio between two colors (1:1 to 21:1) */
export function contrastRatio(fg: string, bg: string): number {
  const fgC = parseColor(fg)
  const bgC = parseColor(bg)
  if (!fgC || !bgC) return 1
  const l1 = relativeLuminance(fgC.r, fgC.g, fgC.b)
  const l2 = relativeLuminance(bgC.r, bgC.g, bgC.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Full WCAG 2.1 contrast check */
export function checkContrast(fg: string, bg: string): ContrastResult {
  const ratio = contrastRatio(fg, bg)
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  }
}

/** Validate all critical color pairs in a theme. Returns issues found. */
export function validateThemeContrast(tokens: DesignTokens): string[] {
  const issues: string[] = []
  const c = tokens.colors

  const checks: Array<{ name: string; fg: string; bg: string; minRatio: number }> = [
    { name: 'title vs background', fg: c.text, bg: c.bg, minRatio: 4.5 },
    { name: 'body text vs background', fg: c.textMuted, bg: c.bg, minRatio: 4.5 },
    { name: 'accent vs background', fg: c.primary, bg: c.bg, minRatio: 3 },
  ]

  for (const check of checks) {
    const fgSolid = extractSolidColor(check.fg)
    const bgSolid = extractSolidColor(check.bg)
    const ratio = contrastRatio(fgSolid, bgSolid)
    if (ratio < check.minRatio) {
      issues.push(`${check.name}: ratio ${ratio.toFixed(2)} < ${check.minRatio} (AA fail)`)
    }
  }

  return issues
}

// ── Color Manipulation ────────────────────────────────────────────────────

/** Lighten a hex color by a factor (0-1) */
export function lightenColor(hex: string, factor: number): string {
  const c = parseColor(hex)
  if (!c) return hex
  const r = Math.min(255, Math.round(c.r + (255 - c.r) * factor))
  const g = Math.min(255, Math.round(c.g + (255 - c.g) * factor))
  const b = Math.min(255, Math.round(c.b + (255 - c.b) * factor))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** Darken a hex color by a factor (0-1) */
export function darkenColor(hex: string, factor: number): string {
  const c = parseColor(hex)
  if (!c) return hex
  const r = Math.max(0, Math.round(c.r * (1 - factor)))
  const g = Math.max(0, Math.round(c.g * (1 - factor)))
  const b = Math.max(0, Math.round(c.b * (1 - factor)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** Generate an accent-tinted background at a given opacity */
export function accentTint(accentHex: string, opacity: number): string {
  const c = parseColor(accentHex)
  if (!c) return `rgba(0,0,0,${opacity})`
  return `rgba(${c.r},${c.g},${c.b},${opacity})`
}

// ── Theme Matching Engine ─────────────────────────────────────────────────

const CONTENT_TYPE_WEIGHTS: Record<ContentType, {
  formalityRange: [ContentFormality, ContentFormality]
  preferredSchemes: ColorScheme[]
  moodKeywords: string[]
}> = {
  academic: {
    formalityRange: ['medium-high', 'high'],
    preferredSchemes: ['light', 'mixed'],
    moodKeywords: ['editorial', 'quiet', 'considered', 'scholarly', 'literary', 'restrained'],
  },
  business: {
    formalityRange: ['medium-high', 'high'],
    preferredSchemes: ['light', 'mixed'],
    moodKeywords: ['professional', 'modern', 'trustworthy', 'institutional', 'calm'],
  },
  creative: {
    formalityRange: ['low', 'medium'],
    preferredSchemes: ['light', 'dark', 'mixed'],
    moodKeywords: ['bold', 'playful', 'energetic', 'electric', 'confident', 'graphic'],
  },
  technical: {
    formalityRange: ['medium', 'medium-high'],
    preferredSchemes: ['dark', 'mixed'],
    moodKeywords: ['modern', 'clean', 'graphic', 'design-led', 'geeky'],
  },
}

/** Score how well a theme matches a content type (0-100) */
export function scoreThemeForContent(tokens: DesignTokens, contentType: ContentType): number {
  const weights = CONTENT_TYPE_WEIGHTS[contentType]
  const meta = tokens.meta
  let score = 50

  const formalityOrder: ContentFormality[] = ['low', 'medium-low', 'medium', 'medium-high', 'high']
  const [minF, maxF] = weights.formalityRange
  const idx = formalityOrder.indexOf(meta.formality)
  const minIdx = formalityOrder.indexOf(minF)
  const maxIdx = formalityOrder.indexOf(maxF)
  if (idx >= minIdx && idx <= maxIdx) {
    score += 20
  } else {
    const dist = Math.min(Math.abs(idx - minIdx), Math.abs(idx - maxIdx))
    score -= dist * 10
  }

  if (weights.preferredSchemes.includes(meta.scheme)) {
    score += 15
  } else {
    score -= 5
  }

  const moodOverlap = meta.mood.filter(m =>
    weights.moodKeywords.some(k => m.includes(k) || k.includes(m))
  ).length
  score += Math.min(15, moodOverlap * 5)

  if (meta.bestFor.includes(contentType)) {
    score += 15
  }

  if (meta.avoidFor?.includes(contentType)) {
    score -= 20
  }

  return Math.max(0, Math.min(100, score))
}

/** Get ranked theme recommendations for a content type */
export function recommendThemes(
  allTokens: DesignTokens[],
  contentType: ContentType,
  limit = 4,
): ThemeRecommendation[] {
  return allTokens
    .map(t => ({
      slug: t.slug,
      score: scoreThemeForContent(t, contentType),
      reason: buildRecommendationReason(t, contentType),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

function buildRecommendationReason(tokens: DesignTokens, contentType: ContentType): string {
  const parts: string[] = []
  if (tokens.meta.bestFor.includes(contentType)) {
    parts.push(`Optimized for ${contentType} content`)
  }
  parts.push(`${tokens.meta.formality} formality, ${tokens.meta.scheme} scheme`)
  if (tokens.meta.mood.length > 0) {
    parts.push(`Mood: ${tokens.meta.mood.slice(0, 3).join(', ')}`)
  }
  return parts.join('. ')
}

/** Find the closest matching theme for a given primary color hex */
export function findThemeByColor(allTokens: DesignTokens[], targetHex: string): ThemeRecommendation[] {
  const target = parseColor(targetHex)
  if (!target) return []

  return allTokens
    .map(t => {
      const themePrimary = parseColor(extractSolidColor(t.colors.primary))
      if (!themePrimary) return { slug: t.slug, score: 0, reason: '' }
      const dist = Math.sqrt(
        Math.pow(target.r - themePrimary.r, 2) +
        Math.pow(target.g - themePrimary.g, 2) +
        Math.pow(target.b - themePrimary.b, 2),
      )
      const maxDist = Math.sqrt(255 * 255 * 3)
      const score = Math.round((1 - dist / maxDist) * 100)
      return {
        slug: t.slug,
        score,
        reason: `Color proximity match (${score}% similar to ${t.meta.label})`,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}
