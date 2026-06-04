import { describe, it, expect } from 'vitest'
import {
  getStyleConfig,
  extractSolidColor,
  parseHexColor,
  lighten,
  darken,
  accentTint
} from '../../src/main/export/styles'

describe('getStyleConfig', () => {
  const ALL_PRESETS = [
    'bold-signal', 'electric-studio', 'creative-voltage', 'dark-botanical',
    'notebook-tabs', 'pastel-geometry', 'split-pastel', 'vintage-editorial',
    'neon-cyber', 'terminal-green', 'swiss-modern', 'paper-ink'
  ]

  it('returns config for every known preset', () => {
    for (const preset of ALL_PRESETS) {
      const config = getStyleConfig(preset)
      expect(config).toBeDefined()
      expect(config.label).toBeTruthy()
      expect(config.displayFont).toBeTruthy()
      expect(config.bodyFont).toBeTruthy()
      expect(config.fontsUrl).toContain('fonts.googleapis.com')
    }
  })

  it('returns bold-signal as default for unknown preset', () => {
    const config = getStyleConfig('nonexistent-theme')
    expect(config.label).toBe('Bold Signal')
  })

  it('every preset has valid hex colors for required fields', () => {
    const hexFields = [
      'titleAccentBg', 'dotActive', 'contentHeaderBorder', 'contentBulletDot'
    ] as const
    const hexRegex = /^#[0-9a-fA-F]{6}$/

    for (const preset of ALL_PRESETS) {
      const config = getStyleConfig(preset)
      for (const field of hexFields) {
        expect(hexRegex.test(config[field]), `${preset}.${field} = ${config[field]}`).toBe(true)
      }
    }
  })

  it('every preset has display and body fonts with Chinese fallbacks', () => {
    for (const preset of ALL_PRESETS) {
      const config = getStyleConfig(preset)
      expect(config.displayFont).toContain('Noto')
      expect(config.bodyFont).toContain('Noto')
    }
  })
})

describe('extractSolidColor', () => {
  it('extracts 6-digit hex from solid color', () => {
    expect(extractSolidColor('#ff5722')).toBe('#ff5722')
  })

  it('extracts first hex from gradient', () => {
    expect(extractSolidColor('linear-gradient(90deg, #f5e6dc 50%, #e4dff0 50%)')).toBe('#f5e6dc')
  })

  it('returns fallback for no hex', () => {
    expect(extractSolidColor('white')).toBe('#333333')
  })

  it('expands 3-digit hex to 6-digit', () => {
    expect(extractSolidColor('#abc')).toBe('#aabbcc')
  })
})

describe('parseHexColor', () => {
  it('parses 6-digit hex', () => {
    expect(parseHexColor('#ff5722')).toEqual({ r: 255, g: 87, b: 34 })
  })

  it('returns null for invalid hex', () => {
    expect(parseHexColor('not-a-color')).toBeNull()
  })
})

describe('lighten', () => {
  it('lightens a color by factor', () => {
    const result = lighten('#000000', 0.5)
    // 0 + (255-0)*0.5 = 127.5 → rounds to 128 = 0x80
    expect(result).toBe('#808080')
  })

  it('returns white at factor 1', () => {
    const result = lighten('#000000', 1)
    expect(result).toBe('#ffffff')
  })

  it('returns same color at factor 0', () => {
    const result = lighten('#ff5722', 0)
    expect(result).toBe('#ff5722')
  })

  it('handles invalid hex gracefully', () => {
    expect(lighten('invalid', 0.5)).toBe('invalid')
  })
})

describe('darken', () => {
  it('darkens a color by factor', () => {
    const result = darken('#ffffff', 0.5)
    // 255 * (1-0.5) = 127.5 → rounds to 128 = 0x80
    expect(result).toBe('#808080')
  })

  it('returns black at factor 1', () => {
    const result = darken('#ffffff', 1)
    expect(result).toBe('#000000')
  })
})

describe('accentTint', () => {
  it('generates rgba from hex', () => {
    expect(accentTint('#ff5722', 0.3)).toBe('rgba(255,87,34,0.3)')
  })

  it('returns black fallback for invalid hex', () => {
    expect(accentTint('invalid', 0.5)).toBe('rgba(0,0,0,0.5)')
  })
})
