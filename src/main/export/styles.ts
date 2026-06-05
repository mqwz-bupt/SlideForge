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
  /** Background effect class applied to slides for visual depth */
  bgEffect?: 'noise-overlay' | 'grid-pattern' | 'gradient-mesh' | 'dots-pattern' | 'diagonal-lines' | 'none'
  /** Theme-specific CSS overrides for unique visual identity */
  themeCSS?: string
}

type StylePreset =
  | 'bold-signal' | 'electric-studio' | 'creative-voltage' | 'dark-botanical'
  | 'notebook-tabs' | 'pastel-geometry' | 'split-pastel' | 'vintage-editorial'
  | 'neon-cyber' | 'terminal-green' | 'swiss-modern' | 'paper-ink'
  | 'chinese-ink' | 'cinematic' | 'neo-brutalist' | 'aurora'

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
    dotInactive: 'rgba(255,255,255,0.4)',
    bgEffect: 'noise-overlay',
    themeCSS: `
.bold-signal-accent { display: inline-block; padding: 12px 32px; background: var(--title-accent-bg); color: var(--title-accent-color); font-size: var(--h3-size); font-weight: 800; border-radius: 4px; transform: rotate(-1deg); }
.title-slide .section-number-display { font-family: var(--display-font); font-size: clamp(5rem, 15vw, 12rem); font-weight: 900; color: var(--title-accent-bg); opacity: 0.15; position: absolute; top: -2%; left: -2%; line-height: 1; pointer-events: none; z-index: 1; }
`
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
    dotInactive: 'rgba(10,10,10,0.35)',
    bgEffect: 'diagonal-lines',
    themeCSS: `
.electric-split { display: grid; grid-template-columns: 1fr 1fr; height: 100%; }
.electric-split-left { background: #ffffff; display: flex; flex-direction: column; justify-content: center; padding: var(--slide-padding); }
.electric-split-right { background: var(--title-accent-bg); color: #ffffff; display: flex; flex-direction: column; justify-content: center; padding: var(--slide-padding); }
`
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
    dotInactive: 'rgba(255,255,255,0.4)',
    bgEffect: 'dots-pattern',
    themeCSS: `
.halftone-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 0; background: radial-gradient(circle, var(--title-accent-bg) 1px, transparent 1.5px); background-size: 8px 8px; opacity: 0.08; }
.neon-badge { display: inline-block; padding: 6px 20px; border: 2px solid var(--title-accent-bg); color: var(--title-accent-bg); font-size: var(--small-size); font-weight: 700; text-transform: uppercase; letter-spacing: 2px; background: transparent; }
`
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
    dotInactive: 'rgba(232,228,223,0.35)',
    bgEffect: 'noise-overlay',
    themeCSS: `
.botanical-frame { position: absolute; top: 12px; right: 12px; bottom: 12px; left: 12px; border: 1px solid var(--title-accent-bg); opacity: 0.15; pointer-events: none; border-radius: 2px; }
.botanical-ornament { font-family: var(--display-font); font-size: var(--h2-size); color: var(--title-accent-bg); opacity: 0.3; position: absolute; bottom: var(--slide-padding); right: var(--slide-padding); pointer-events: none; }
`
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
    dotInactive: 'rgba(26,26,26,0.3)',
    bgEffect: 'none',
    themeCSS: `
.tab-marker { position: absolute; top: 0; right: 20%; width: 80px; height: 32px; background: var(--title-accent-bg); color: var(--title-accent-color); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; border-radius: 0 0 8px 8px; letter-spacing: 1px; text-transform: uppercase; }
`
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
    dotInactive: 'rgba(26,26,26,0.3)',
    bgEffect: 'dots-pattern',
    themeCSS: `
.geo-shape { position: absolute; width: 120px; height: 120px; border: 3px solid var(--title-accent-bg); opacity: 0.1; pointer-events: none; border-radius: 50%; }
.geo-shape-2 { position: absolute; width: 80px; height: 80px; background: var(--title-accent-bg); opacity: 0.05; pointer-events: none; transform: rotate(45deg); }
`
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
    dotInactive: 'rgba(26,26,26,0.3)',
    bgEffect: 'none',
    themeCSS: `
.split-divider { position: absolute; top: 0; bottom: 0; left: 50%; width: 2px; background: linear-gradient(180deg, transparent, var(--title-accent-bg), transparent); opacity: 0.3; pointer-events: none; }
`
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
    dotInactive: 'rgba(26,26,26,0.3)',
    bgEffect: 'noise-overlay',
    themeCSS: `
.editorial-dropcap { float: left; font-family: var(--display-font); font-size: clamp(3rem, 8vw, 6rem); line-height: 0.8; padding-right: 8px; color: var(--title-accent-bg); font-weight: 900; }
.editorial-rule { width: 60px; height: 2px; background: var(--title-accent-bg); margin: 0 auto var(--content-gap); }
`
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
    dotInactive: 'rgba(0,255,204,0.35)',
    bgEffect: 'grid-pattern',
    themeCSS: `
.cyber-scanline { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; z-index: 1; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,204,0.015) 2px, rgba(0,255,204,0.015) 4px); }
.highlight-box { box-shadow: 0 0 20px var(--title-accent-bg), 0 0 40px rgba(0,255,204,0.3); animation: neon-pulse 3s ease-in-out infinite; }
`
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
    dotInactive: 'rgba(57,211,83,0.35)',
    bgEffect: 'grid-pattern',
    themeCSS: `
.terminal-cursor { display: inline-block; width: 10px; height: 1.2em; background: var(--title-accent-bg); margin-left: 4px; vertical-align: text-bottom; animation: blink-cursor 1s step-end infinite; }
@keyframes blink-cursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.terminal-prompt::before { content: '> '; color: var(--title-accent-bg); font-weight: 700; }
`
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
    dotInactive: 'rgba(0,0,0,0.3)',
    bgEffect: 'none',
    themeCSS: `
.swiss-line { position: absolute; top: var(--slide-padding); left: var(--slide-padding); right: var(--slide-padding); height: 3px; background: var(--title-accent-bg); }
.swiss-block { display: inline-block; background: var(--title-accent-bg); color: var(--title-accent-color); padding: 4px 16px; font-weight: 800; font-size: var(--small-size); letter-spacing: 1px; text-transform: uppercase; }
`
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
    dotInactive: 'rgba(26,26,26,0.3)',
    bgEffect: 'noise-overlay',
    themeCSS: `
.ink-splash { position: absolute; bottom: -20px; left: -20px; width: 100px; height: 100px; border-radius: 50%; background: var(--title-accent-bg); opacity: 0.04; filter: blur(20px); pointer-events: none; }
.ink-underline { display: inline; background-image: linear-gradient(transparent 60%, var(--title-accent-bg) 60%); padding: 0 4px; }
`
  },
  'chinese-ink': {
    label: 'Chinese Ink',
    displayFont: "'Noto Serif SC', serif",
    bodyFont: "'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap',
    titleBg: '#f7f3e9',
    titleColor: '#2c2c2c',
    titleAccentBg: '#c23a2b',
    titleAccentColor: '#f7f3e9',
    titleSubtitleColor: 'rgba(44,44,44,0.5)',
    contentBg: '#f7f3e9',
    contentHeaderBorder: '#c23a2b',
    contentTitleColor: '#2c2c2c',
    contentBulletColor: 'rgba(44,44,44,0.6)',
    contentBulletDot: '#c23a2b',
    contentNotesColor: 'rgba(44,44,44,0.35)',
    dotActive: '#c23a2b',
    dotInactive: 'rgba(44,44,44,0.25)',
    bgEffect: 'noise-overlay',
    themeCSS: `
.ink-seal { position: absolute; bottom: var(--slide-padding); right: var(--slide-padding); width: 48px; height: 48px; border: 2px solid var(--title-accent-bg); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: var(--title-accent-bg); font-weight: 700; transform: rotate(8deg); opacity: 0.2; pointer-events: none; }
.ink-wash { position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; border-radius: 50%; background: var(--title-accent-bg); opacity: 0.03; filter: blur(40px); pointer-events: none; }
.ink-brush-line { height: 1px; background: linear-gradient(90deg, var(--title-accent-bg), transparent); opacity: 0.4; margin: 1rem 0; }
`
  },
  'cinematic': {
    label: 'Cinematic',
    displayFont: "'Playfair Display', 'Noto Serif SC', serif",
    bodyFont: "'Inter', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600&family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    titleBg: '#0a0a0a',
    titleColor: '#f5f0e8',
    titleAccentBg: '#d4a843',
    titleAccentColor: '#0a0a0a',
    titleSubtitleColor: 'rgba(245,240,232,0.55)',
    contentBg: '#0a0a0a',
    contentHeaderBorder: '#d4a843',
    contentTitleColor: '#f5f0e8',
    contentBulletColor: 'rgba(245,240,232,0.6)',
    contentBulletDot: '#d4a843',
    contentNotesColor: 'rgba(245,240,232,0.35)',
    dotActive: '#d4a843',
    dotInactive: 'rgba(245,240,232,0.3)',
    bgEffect: 'noise-overlay',
    themeCSS: `
.cine-bar-top, .cine-bar-bottom { position: absolute; left: 0; right: 0; height: 4vh; background: #000; z-index: 2; pointer-events: none; }
.cine-bar-top { top: 0; } .cine-bar-bottom { bottom: 0; }
.cine-frame { position: absolute; top: 5vh; left: 3vw; right: 3vw; bottom: 5vh; border: 1px solid var(--title-accent-bg); opacity: 0.15; pointer-events: none; }
.cine-rating { position: absolute; top: calc(5vh + 8px); right: calc(3vw + 8px); font-size: 10px; color: var(--title-accent-bg); opacity: 0.4; letter-spacing: 2px; text-transform: uppercase; pointer-events: none; }
`
  },
  'neo-brutalist': {
    label: 'Neo Brutalist',
    displayFont: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    bodyFont: "'Space Mono', 'Noto Sans SC', monospace",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Space+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap',
    titleBg: '#f0f0ec',
    titleColor: '#1a1a1a',
    titleAccentBg: '#ff2d6f',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: 'rgba(26,26,26,0.6)',
    contentBg: '#f0f0ec',
    contentHeaderBorder: '#1a1a1a',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: 'rgba(26,26,26,0.7)',
    contentBulletDot: '#ff2d6f',
    contentNotesColor: 'rgba(26,26,26,0.4)',
    dotActive: '#ff2d6f',
    dotInactive: 'rgba(26,26,26,0.3)',
    bgEffect: 'none',
    themeCSS: `
.brutal-card { border: 3px solid var(--title-accent-bg); box-shadow: 6px 6px 0 var(--title-accent-bg); padding: 1.5rem; background: var(--title-bg); }
.brutal-sticker { display: inline-block; background: #ffe135; color: #1a1a1a; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; transform: rotate(-3deg); }
.brutal-divider { height: 3px; background: #1a1a1a; margin: 1.5rem 0; }
`
  },
  'aurora': {
    label: 'Aurora',
    displayFont: "'Outfit', 'Noto Sans SC', sans-serif",
    bodyFont: "'DM Sans', 'Noto Sans SC', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    titleBg: '#0c1445',
    titleColor: '#e0f7ef',
    titleAccentBg: '#00e5a0',
    titleAccentColor: '#0c1445',
    titleSubtitleColor: 'rgba(224,247,239,0.55)',
    contentBg: '#0c1445',
    contentHeaderBorder: '#00e5a0',
    contentTitleColor: '#e0f7ef',
    contentBulletColor: 'rgba(224,247,239,0.6)',
    contentBulletDot: '#00e5a0',
    contentNotesColor: 'rgba(224,247,239,0.35)',
    dotActive: '#00e5a0',
    dotInactive: 'rgba(224,247,239,0.3)',
    bgEffect: 'gradient-mesh',
    themeCSS: `
.aurora-glow { text-shadow: 0 0 30px rgba(0,229,160,0.4), 0 0 60px rgba(139,92,246,0.2); }
.aurora-orb { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; opacity: 0.15; }
.aurora-orb-1 { top: 10%; left: 60%; width: 300px; height: 300px; background: #00e5a0; }
.aurora-orb-2 { top: 50%; left: 20%; width: 250px; height: 250px; background: #8b5cf6; }
.aurora-orb-3 { top: 30%; left: 40%; width: 200px; height: 200px; background: #f472b6; }
`
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
