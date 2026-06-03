import type { StylePreset } from '@/shared/types/project'

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

const presets: Record<StylePreset, StyleConfig> = {
  'bold-signal': {
    label: 'Bold Signal',
    displayFont: "'Archivo Black', sans-serif",
    bodyFont: "'Space Grotesk', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500&display=swap',
    titleBg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    titleColor: '#ffffff',
    titleAccentBg: '#FF5722',
    titleAccentColor: '#1a1a1a',
    titleSubtitleColor: 'rgba(255,255,255,0.6)',
    contentBg: '#ffffff',
    contentHeaderBorder: '#FF5722',
    contentTitleColor: '#1A1A2E',
    contentBulletColor: '#444',
    contentBulletDot: '#FF5722',
    contentNotesColor: 'rgba(0,0,0,0.25)',
    dotActive: '#FF5722',
    dotInactive: 'rgba(255,255,255,0.3)'
  },
  'electric-studio': {
    label: 'Electric Studio',
    displayFont: "'Manrope', sans-serif",
    bodyFont: "'Manrope', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;800&display=swap',
    titleBg: 'linear-gradient(180deg, #ffffff 55%, #4361ee 55%)',
    titleColor: '#0a0a0a',
    titleAccentBg: '#4361ee',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: '#0a0a0a',
    contentBg: '#ffffff',
    contentHeaderBorder: '#4361ee',
    contentTitleColor: '#0a0a0a',
    contentBulletColor: '#333',
    contentBulletDot: '#4361ee',
    contentNotesColor: 'rgba(0,0,0,0.2)',
    dotActive: '#4361ee',
    dotInactive: 'rgba(0,0,0,0.15)'
  },
  'creative-voltage': {
    label: 'Creative Voltage',
    displayFont: "'Syne', sans-serif",
    bodyFont: "'Space Mono', monospace",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&display=swap',
    titleBg: 'linear-gradient(90deg, #0066ff 50%, #1a1a2e 50%)',
    titleColor: '#ffffff',
    titleAccentBg: '#d4ff00',
    titleAccentColor: '#1a1a2e',
    titleSubtitleColor: 'rgba(255,255,255,0.7)',
    contentBg: '#1a1a2e',
    contentHeaderBorder: '#d4ff00',
    contentTitleColor: '#ffffff',
    contentBulletColor: '#ccc',
    contentBulletDot: '#d4ff00',
    contentNotesColor: 'rgba(255,255,255,0.2)',
    dotActive: '#d4ff00',
    dotInactive: 'rgba(255,255,255,0.25)'
  },
  'dark-botanical': {
    label: 'Dark Botanical',
    displayFont: "'Cormorant', serif",
    bodyFont: "'IBM Plex Sans', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant:wght@400;600&family=IBM+Plex+Sans:wght@300;400&display=swap',
    titleBg: '#0f0f0f',
    titleColor: '#e8e4df',
    titleAccentBg: '#d4a574',
    titleAccentColor: '#0f0f0f',
    titleSubtitleColor: '#9a9590',
    contentBg: '#f5f0eb',
    contentHeaderBorder: '#d4a574',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: '#555',
    contentBulletDot: '#d4a574',
    contentNotesColor: 'rgba(0,0,0,0.2)',
    dotActive: '#d4a574',
    dotInactive: 'rgba(255,255,255,0.2)'
  },
  'notebook-tabs': {
    label: 'Notebook Tabs',
    displayFont: "'Bodoni Moda', serif",
    bodyFont: "'DM Sans', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&family=DM+Sans:wght@400;500&display=swap',
    titleBg: '#2d2d2d',
    titleColor: '#f8f6f1',
    titleAccentBg: '#98d4bb',
    titleAccentColor: '#2d2d2d',
    titleSubtitleColor: 'rgba(248,246,241,0.6)',
    contentBg: '#f8f6f1',
    contentHeaderBorder: '#2d2d2d',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: '#444',
    contentBulletDot: '#2d2d2d',
    contentNotesColor: 'rgba(0,0,0,0.2)',
    dotActive: '#98d4bb',
    dotInactive: 'rgba(255,255,255,0.3)'
  },
  'pastel-geometry': {
    label: 'Pastel Geometry',
    displayFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap',
    titleBg: '#c8d9e6',
    titleColor: '#1a1a1a',
    titleAccentBg: '#9b8dc4',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: 'rgba(26,26,26,0.6)',
    contentBg: '#faf9f7',
    contentHeaderBorder: '#9b8dc4',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: '#444',
    contentBulletDot: '#9b8dc4',
    contentNotesColor: 'rgba(0,0,0,0.2)',
    dotActive: '#9b8dc4',
    dotInactive: 'rgba(0,0,0,0.12)'
  },
  'split-pastel': {
    label: 'Split Pastel',
    displayFont: "'Outfit', sans-serif",
    bodyFont: "'Outfit', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&display=swap',
    titleBg: 'linear-gradient(90deg, #f5e6dc 50%, #e4dff0 50%)',
    titleColor: '#1a1a1a',
    titleAccentBg: '#c8f0d8',
    titleAccentColor: '#1a1a1a',
    titleSubtitleColor: '#555',
    contentBg: '#ffffff',
    contentHeaderBorder: '#c8f0d8',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: '#444',
    contentBulletDot: '#c8f0d8',
    contentNotesColor: 'rgba(0,0,0,0.2)',
    dotActive: '#c8f0d8',
    dotInactive: 'rgba(0,0,0,0.12)'
  },
  'vintage-editorial': {
    label: 'Vintage Editorial',
    displayFont: "'Fraunces', serif",
    bodyFont: "'Work Sans', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Work+Sans:wght@400;500&display=swap',
    titleBg: '#f5f3ee',
    titleColor: '#1a1a1a',
    titleAccentBg: '#e8d4c0',
    titleAccentColor: '#1a1a1a',
    titleSubtitleColor: '#555',
    contentBg: '#f5f3ee',
    contentHeaderBorder: '#1a1a1a',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: '#444',
    contentBulletDot: '#1a1a1a',
    contentNotesColor: 'rgba(0,0,0,0.2)',
    dotActive: '#1a1a1a',
    dotInactive: 'rgba(0,0,0,0.12)'
  },
  'neon-cyber': {
    label: 'Neon Cyber',
    displayFont: "'Archivo Black', sans-serif",
    bodyFont: "'Space Grotesk', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500&display=swap',
    titleBg: '#0a0f1c',
    titleColor: '#00ffcc',
    titleAccentBg: '#00ffcc',
    titleAccentColor: '#0a0f1c',
    titleSubtitleColor: 'rgba(0,255,204,0.6)',
    contentBg: '#0a0f1c',
    contentHeaderBorder: '#00ffcc',
    contentTitleColor: '#00ffcc',
    contentBulletColor: '#aab',
    contentBulletDot: '#00ffcc',
    contentNotesColor: 'rgba(0,255,204,0.2)',
    dotActive: '#00ffcc',
    dotInactive: 'rgba(0,255,204,0.2)'
  },
  'terminal-green': {
    label: 'Terminal Green',
    displayFont: "'JetBrains Mono', monospace",
    bodyFont: "'JetBrains Mono', monospace",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
    titleBg: '#0d1117',
    titleColor: '#39d353',
    titleAccentBg: '#39d353',
    titleAccentColor: '#0d1117',
    titleSubtitleColor: 'rgba(57,211,83,0.6)',
    contentBg: '#0d1117',
    contentHeaderBorder: '#39d353',
    contentTitleColor: '#39d353',
    contentBulletColor: '#8b949e',
    contentBulletDot: '#39d353',
    contentNotesColor: 'rgba(57,211,83,0.2)',
    dotActive: '#39d353',
    dotInactive: 'rgba(57,211,83,0.2)'
  },
  'swiss-modern': {
    label: 'Swiss Modern',
    displayFont: "'Archivo', sans-serif",
    bodyFont: "'Nunito', sans-serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo:wght@800&family=Nunito:wght@400&display=swap',
    titleBg: '#ffffff',
    titleColor: '#000000',
    titleAccentBg: '#ff3300',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: '#666',
    contentBg: '#ffffff',
    contentHeaderBorder: '#ff3300',
    contentTitleColor: '#000000',
    contentBulletColor: '#333',
    contentBulletDot: '#ff3300',
    contentNotesColor: 'rgba(0,0,0,0.2)',
    dotActive: '#ff3300',
    dotInactive: 'rgba(0,0,0,0.12)'
  },
  'paper-ink': {
    label: 'Paper & Ink',
    displayFont: "'Cormorant Garamond', serif",
    bodyFont: "'Source Serif 4', serif",
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Source+Serif+4:wght@400&display=swap',
    titleBg: '#faf9f7',
    titleColor: '#1a1a1a',
    titleAccentBg: '#c41e3a',
    titleAccentColor: '#ffffff',
    titleSubtitleColor: '#666',
    contentBg: '#faf9f7',
    contentHeaderBorder: '#c41e3a',
    contentTitleColor: '#1a1a1a',
    contentBulletColor: '#444',
    contentBulletDot: '#c41e3a',
    contentNotesColor: 'rgba(0,0,0,0.2)',
    dotActive: '#c41e3a',
    dotInactive: 'rgba(0,0,0,0.12)'
  }
}

export function getStyleConfig(preset: StylePreset): StyleConfig {
  return presets[preset]
}

export const stylePresets: { value: StylePreset; label: string }[] = [
  { value: 'bold-signal', label: 'Bold Signal' },
  { value: 'electric-studio', label: 'Electric Studio' },
  { value: 'creative-voltage', label: 'Creative Voltage' },
  { value: 'dark-botanical', label: 'Dark Botanical' },
  { value: 'notebook-tabs', label: 'Notebook Tabs' },
  { value: 'pastel-geometry', label: 'Pastel Geometry' },
  { value: 'split-pastel', label: 'Split Pastel' },
  { value: 'vintage-editorial', label: 'Vintage Editorial' },
  { value: 'neon-cyber', label: 'Neon Cyber' },
  { value: 'terminal-green', label: 'Terminal Green' },
  { value: 'swiss-modern', label: 'Swiss Modern' },
  { value: 'paper-ink', label: 'Paper & Ink' }
]
