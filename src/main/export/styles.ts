// Style presets for main process export modules
// Mirrors renderer's stylePresets.ts — single source of truth is the renderer copy,
// this duplicate exists because main/renderer are separate bundles in electron-vite.
//
// This file now exports both the legacy StyleConfig (backward compat) and color
// utility functions needed by html.ts and pptx.ts.

export interface StyleConfig {
  label: string
  displayFont: string
  bodyFont: string
  fontsUrl: string
  titleBg: string
  titleColor: string
  titleAccentBg: string
  titleAccentColor: string
  titleSubtitleColor: string
  contentBg: string
  contentHeaderBorder: string
  contentTitleColor: string
  contentBulletColor: string
  contentBulletDot: string
  contentNotesColor: string
  dotActive: string
  dotInactive: string
}

type StylePreset =
  | 'bold-signal' | 'electric-studio' | 'creative-voltage' | 'dark-botanical'
  | 'notebook-tabs' | 'pastel-geometry' | 'split-pastel' | 'vintage-editorial'
  | 'neon-cyber' | 'terminal-green' | 'swiss-modern' | 'paper-ink'

const presets: Record<string, StyleConfig> = {
  'bold-signal': {
    label: 'Bold Signal',
    displayFont: "'Archivo Black', 'Noto Sans SC', sans-serif",
    bodyFont: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;700&display=swap',
    titleBg: '#1a1a1a',
    titleColor: '#ffffff',
    titleAccentBg: '#FF5722',
    titleAccentColor: '#1a1a1a',
    titleSubtitleColor: 'rgba(255,255,255,0.7)',
    contentBg: '#1a1a1a',
    contentHeaderBorder: '#FF5722',
    contentTitleColor: '#ffffff',
    contentBulletColor: 'rgba(255,255,255,0.7)',
    contentBulletDot: '#FF5722',
    contentNotesColor: 'rgba(255,255,255,0.4)',
    dotActive: '#FF5722',
    dotInactive: 'rgba(255,255,255,0.4)'
  },
  'electric-studio': {
    label: 'Electric Studio',
    displayFont: "'Manrope', 'Noto Sans SC', sans-serif",
    bodyFont: "'Manrope', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700&display=swap',
    titleBg: '#ffffff',
    titleColor: '#0a0a0a',
    titleAccentBg: '#4361ee',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: 'rgba(10,10,10,0.6)',
    contentBg: '#ffffff',
    contentHeaderBorder: '#4361ee',
    contentTitleColor: '#0a0a0a',
    contentBulletColor: 'rgba(10,10,10,0.6)',
    contentBulletDot: '#4361ee',
    contentNotesColor: 'rgba(10,10,10,0.35)',
    dotActive: '#4361ee',
    dotInactive: 'rgba(10,10,10,0.35)'
  },
  'creative-voltage': {
    label: 'Creative Voltage',
    displayFont: "'Syne', 'Noto Sans SC', sans-serif",
    bodyFont: "'Space Mono', 'Noto Sans SC', monospace",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&display=swap',
    titleBg: '#1a1a2e',
    titleColor: '#ffffff',
    titleAccentBg: '#d4ff00',
    titleAccentColor: '#1a1a2e',
    titleSubtitleColor: 'rgba(255,255,255,0.7)',
    contentBg: '#1a1a2e',
    contentHeaderBorder: '#d4ff00',
    contentTitleColor: '#ffffff',
    contentBulletColor: 'rgba(255,255,255,0.7)',
    contentBulletDot: '#d4ff00',
    contentNotesColor: 'rgba(255,255,255,0.4)',
    dotActive: '#d4ff00',
    dotInactive: 'rgba(255,255,255,0.4)'
  },
  'dark-botanical': {
    label: 'Dark Botanical',
    displayFont: "'Cormorant', 'Noto Serif SC', serif",
    bodyFont: "'IBM Plex Sans', 'Noto Serif SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500&family=Noto+Serif+SC:wght@400;500;700&display=swap',
    titleBg: '#0f0f0f',
    titleColor: '#e8e4df',
    titleAccentBg: '#d4a574',
    titleAccentColor: '#0f0f0f',
    titleSubtitleColor: 'rgba(232,228,223,0.6)',
    contentBg: '#0f0f0f',
    contentHeaderBorder: '#d4a574',
    contentTitleColor: '#e8e4df',
    contentBulletColor: 'rgba(232,228,223,0.6)',
    contentBulletDot: '#d4a574',
    contentNotesColor: 'rgba(232,228,223,0.35)',
    dotActive: '#d4a574',
    dotInactive: 'rgba(232,228,223,0.35)'
  },
  'notebook-tabs': {
    label: 'Notebook Tabs',
    displayFont: "'Bodoni Moda', 'Noto Serif SC', serif",
    bodyFont: "'DM Sans', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&family=DM+Sans:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    titleBg: '#2d2d2d',
    titleColor: '#f8f6f1',
    titleAccentBg: '#98d4bb',
    titleAccentColor: '#2d2d2d',
    titleSubtitleColor: 'rgba(248,246,241,0.6)',
    contentBg: '#f8f6f1',
    contentHeaderBorder: '#2d2d2d',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: 'rgba(26,26,26,0.55)',
    contentBulletDot: '#2d2d2d',
    contentNotesColor: 'rgba(26,26,26,0.3)',
    dotActive: '#98d4bb',
    dotInactive: 'rgba(26,26,26,0.3)'
  },
  'pastel-geometry': {
    label: 'Pastel Geometry',
    displayFont: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif",
    bodyFont: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    titleBg: '#faf9f7',
    titleColor: '#1a1a1a',
    titleAccentBg: '#9b8dc4',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: 'rgba(26,26,26,0.55)',
    contentBg: '#faf9f7',
    contentHeaderBorder: '#9b8dc4',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: 'rgba(26,26,26,0.55)',
    contentBulletDot: '#9b8dc4',
    contentNotesColor: 'rgba(26,26,26,0.3)',
    dotActive: '#9b8dc4',
    dotInactive: 'rgba(26,26,26,0.3)'
  },
  'split-pastel': {
    label: 'Split Pastel',
    displayFont: "'Outfit', 'Noto Sans SC', sans-serif",
    bodyFont: "'Outfit', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    titleBg: 'linear-gradient(90deg, #f5e6dc 50%, #e4dff0 50%)',
    titleColor: '#1a1a1a',
    titleAccentBg: '#c8f0d8',
    titleAccentColor: '#1a1a1a',
    titleSubtitleColor: 'rgba(26,26,26,0.55)',
    contentBg: '#ffffff',
    contentHeaderBorder: '#c8f0d8',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: 'rgba(26,26,26,0.55)',
    contentBulletDot: '#c8f0d8',
    contentNotesColor: 'rgba(26,26,26,0.3)',
    dotActive: '#c8f0d8',
    dotInactive: 'rgba(26,26,26,0.3)'
  },
  'vintage-editorial': {
    label: 'Vintage Editorial',
    displayFont: "'Fraunces', 'Noto Serif SC', serif",
    bodyFont: "'Work Sans', 'Noto Serif SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Work+Sans:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;700;900&display=swap',
    titleBg: '#f5f3ee',
    titleColor: '#1a1a1a',
    titleAccentBg: '#e8d4c0',
    titleAccentColor: '#1a1a1a',
    titleSubtitleColor: 'rgba(26,26,26,0.55)',
    contentBg: '#f5f3ee',
    contentHeaderBorder: '#1a1a1a',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: 'rgba(26,26,26,0.55)',
    contentBulletDot: '#1a1a1a',
    contentNotesColor: 'rgba(26,26,26,0.3)',
    dotActive: '#1a1a1a',
    dotInactive: 'rgba(26,26,26,0.3)'
  },
  'neon-cyber': {
    label: 'Neon Cyber',
    displayFont: "'Archivo Black', 'Noto Sans SC', sans-serif",
    bodyFont: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;700&display=swap',
    titleBg: '#0a0f1c',
    titleColor: '#00ffcc',
    titleAccentBg: '#00ffcc',
    titleAccentColor: '#0a0f1c',
    titleSubtitleColor: 'rgba(0,255,204,0.6)',
    contentBg: '#0a0f1c',
    contentHeaderBorder: '#00ffcc',
    contentTitleColor: '#00ffcc',
    contentBulletColor: 'rgba(0,255,204,0.6)',
    contentBulletDot: '#00ffcc',
    contentNotesColor: 'rgba(0,255,204,0.35)',
    dotActive: '#00ffcc',
    dotInactive: 'rgba(0,255,204,0.35)'
  },
  'terminal-green': {
    label: 'Terminal Green',
    displayFont: "'JetBrains Mono', 'Noto Sans SC', monospace",
    bodyFont: "'JetBrains Mono', 'Noto Sans SC', monospace",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    titleBg: '#0d1117',
    titleColor: '#39d353',
    titleAccentBg: '#39d353',
    titleAccentColor: '#0d1117',
    titleSubtitleColor: 'rgba(57,211,83,0.6)',
    contentBg: '#0d1117',
    contentHeaderBorder: '#39d353',
    contentTitleColor: '#39d353',
    contentBulletColor: 'rgba(57,211,83,0.6)',
    contentBulletDot: '#39d353',
    contentNotesColor: 'rgba(57,211,83,0.35)',
    dotActive: '#39d353',
    dotInactive: 'rgba(57,211,83,0.35)'
  },
  'swiss-modern': {
    label: 'Swiss Modern',
    displayFont: "'Archivo', 'Noto Sans SC', sans-serif",
    bodyFont: "'Nunito', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Nunito:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    titleBg: '#ffffff',
    titleColor: '#000000',
    titleAccentBg: '#ff3300',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: 'rgba(0,0,0,0.55)',
    contentBg: '#ffffff',
    contentHeaderBorder: '#ff3300',
    contentTitleColor: '#000000',
    contentBulletColor: 'rgba(0,0,0,0.55)',
    contentBulletDot: '#ff3300',
    contentNotesColor: 'rgba(0,0,0,0.3)',
    dotActive: '#ff3300',
    dotInactive: 'rgba(0,0,0,0.3)'
  },
  'paper-ink': {
    label: 'Paper & Ink',
    displayFont: "'Cormorant Garamond', 'Noto Serif SC', serif",
    bodyFont: "'Source Serif 4', 'Noto Serif SC', serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Source+Serif+4:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;700&display=swap',
    titleBg: '#faf9f7',
    titleColor: '#1a1a1a',
    titleAccentBg: '#c41e3a',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: 'rgba(26,26,26,0.55)',
    contentBg: '#faf9f7',
    contentHeaderBorder: '#c41e3a',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: 'rgba(26,26,26,0.55)',
    contentBulletDot: '#c41e3a',
    contentNotesColor: 'rgba(26,26,26,0.3)',
    dotActive: '#c41e3a',
    dotInactive: 'rgba(26,26,26,0.3)'
  }
}

export function getStyleConfig(preset: string): StyleConfig {
  return presets[preset] ?? presets['bold-signal']
}

/** Extract first solid hex color from a possibly-gradient CSS value, always 6-digit */
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

/** Parse hex to {r,g,b} */
export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '')
  if (cleaned.length === 6) {
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16),
    }
  }
  return null
}

/** Lighten a hex color by factor (0-1) */
export function lighten(hex: string, factor: number): string {
  const c = parseHexColor(hex)
  if (!c) return hex
  const r = Math.min(255, Math.round(c.r + (255 - c.r) * factor))
  const g = Math.min(255, Math.round(c.g + (255 - c.g) * factor))
  const b = Math.min(255, Math.round(c.b + (255 - c.b) * factor))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** Darken a hex color by factor (0-1) */
export function darken(hex: string, factor: number): string {
  const c = parseHexColor(hex)
  if (!c) return hex
  const r = Math.max(0, Math.round(c.r * (1 - factor)))
  const g = Math.max(0, Math.round(c.g * (1 - factor)))
  const b = Math.max(0, Math.round(c.b * (1 - factor)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** Generate rgba accent tint from a hex color */
export function accentTint(hex: string, opacity: number): string {
  const c = parseHexColor(hex)
  if (!c) return `rgba(0,0,0,${opacity})`
  return `rgba(${c.r},${c.g},${c.b},${opacity})`
}
