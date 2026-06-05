// Design Token System — enhanced from frontend-slides bold-template-pack
// Each theme is a full design system: colors, typography scale, spacing, radii,
// component patterns, decorative elements, mood metadata, and CJK pairing.
//
// This file replaces the previous flat StyleConfig with rich DesignTokens.
// Legacy StyleConfig is still exported for backward compatibility during migration.

import type { StylePreset } from '@/shared/types/project'
import type {
  DesignTokens,
  TypeScaleToken,
} from '@/shared/types/designTokens'

// ── Legacy compat (deprecated, use DesignTokens instead) ──────────────────

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

// ── Helper: build typography tokens concisely ─────────────────────────────

function ts(
  family: string,
  weight: number,
  size: string,
  lh: number,
  ls?: string,
  transform?: 'uppercase' | 'none',
): TypeScaleToken {
  return { fontFamily: family, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: ls, textTransform: transform }
}

// ── Design Token Presets ──────────────────────────────────────────────────

const designTokens: Record<StylePreset, DesignTokens> = {

  // ─── Dark Themes ──────────────────────────────────────────────────────

  'bold-signal': {
    slug: 'bold-signal',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;700&display=swap',
    displayFont: "'Archivo Black', 'Noto Sans SC', sans-serif",
    bodyFont: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#1a1a1a',
      primary: '#FF5722',
      text: '#ffffff',
      textMuted: 'rgba(255,255,255,0.7)',
      textLight: 'rgba(255,255,255,0.4)',
      accentLight: 'rgba(255,87,34,0.08)',
      accentMedium: 'rgba(255,87,34,0.15)',
      border: 'rgba(255,87,34,0.2)',
      cardBg: 'rgba(255,87,34,0.04)',
    },
    typography: {
      h1: ts("'Archivo Black','Noto Sans SC',sans-serif", 400, 'clamp(44px,5vw,67px)', 1.1, '-0.02em'),
      h2: ts("'Space Grotesk','Noto Sans SC',sans-serif", 600, 'clamp(28px,3vw,42px)', 1.1, '-0.02em'),
      h3: ts("'Space Grotesk','Noto Sans SC',sans-serif", 500, 'clamp(18px,1.8vw,24px)', 1.3, '-0.02em'),
      h4Eyebrow: ts("'Space Grotesk','Noto Sans SC',sans-serif", 600, 'clamp(13px,1.2vw,16px)', 1.1, '0.08em', 'uppercase'),
      body: ts("'Inter','Noto Serif SC',sans-serif", 400, 'clamp(14px,1.1vw,17px)', 1.6),
      metricValue: ts("'Space Grotesk','Noto Sans SC',sans-serif", 700, 'clamp(35px,3.4vw,48px)', 1),
      metricLabel: ts("'Inter','Noto Serif SC',sans-serif", 600, 'clamp(15px,1.3vw,18px)', 1.3),
      statNum: ts("'Space Grotesk','Noto Sans SC',sans-serif", 700, 'clamp(26px,2.4vw,34px)', 1),
      blockquote: ts("'Archivo Black','Noto Sans SC',sans-serif", 400, 'clamp(26px,2.8vw,38px)', 1.35),
      tag: ts("'Space Grotesk','Noto Sans SC',sans-serif", 500, '12px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8.5vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.4rem 1.5rem',
      gapGridLg: '3.5rem', gapGridMd: '2rem 3rem', gapCards: '1.2rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '100px', cardLg: '14px', cardMd: '12px', cardSm: '10px', bar: '6px' },
    components: {
      cardTinted: { background: 'rgba(255,87,34,0.04)', border: '1.5px solid rgba(255,87,34,0.2)', borderRadius: '14px', padding: '1.5rem 1.6rem' },
      tagPill: { background: 'rgba(255,87,34,0.08)', color: '#FF5722', padding: '0.35rem 0.9rem', borderRadius: '100px', fontSize: '12px' },
      accentLine: { width: '60px', height: '4px', background: '#FF5722', borderRadius: '2px' },
      coverDecoration: { background: 'rgba(255,87,34,0.06)', clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' },
    },
    decorativeStyle: 'tinted-cards',
    meta: {
      label: 'Bold Signal', tagline: 'Warm dark canvas with electric orange accents.',
      mood: ['bold', 'confident', 'energetic'], tone: ['graphic', 'punchy', 'modern'],
      formality: 'medium', density: 'medium', scheme: 'dark',
      bestFor: ['creative', 'technical'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Serif SC', serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700',
      lineHeightBump: 1.2,
    },
  },

  'electric-studio': {
    slug: 'electric-studio',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700&display=swap',
    displayFont: "'Manrope', 'Noto Sans SC', sans-serif",
    bodyFont: "'Manrope', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#ffffff',
      primary: '#4361ee',
      text: '#0a0a0a',
      textMuted: 'rgba(10,10,10,0.6)',
      textLight: 'rgba(10,10,10,0.35)',
      accentLight: 'rgba(67,97,238,0.08)',
      accentMedium: 'rgba(67,97,238,0.15)',
      border: 'rgba(67,97,238,0.2)',
      cardBg: 'rgba(67,97,238,0.04)',
    },
    typography: {
      h1: ts("'Manrope','Noto Sans SC',sans-serif", 800, 'clamp(40px,4.5vw,60px)', 1.1, '-0.02em'),
      h2: ts("'Manrope','Noto Sans SC',sans-serif", 700, 'clamp(26px,2.8vw,38px)', 1.1, '-0.01em'),
      h3: ts("'Manrope','Noto Sans SC',sans-serif", 600, 'clamp(17px,1.6vw,22px)', 1.3),
      h4Eyebrow: ts("'Manrope','Noto Sans SC',sans-serif", 700, 'clamp(12px,1.1vw,15px)', 1.1, '0.08em', 'uppercase'),
      body: ts("'Inter','Noto Serif SC',sans-serif", 400, 'clamp(14px,1vw,17px)', 1.6),
      metricValue: ts("'Manrope','Noto Sans SC',sans-serif", 800, 'clamp(32px,3vw,44px)', 1),
      metricLabel: ts("'Inter','Noto Serif SC',sans-serif", 600, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Manrope','Noto Sans SC',sans-serif", 700, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Manrope','Noto Sans SC',sans-serif", 700, 'clamp(24px,2.5vw,36px)', 1.35),
      tag: ts("'Manrope','Noto Sans SC',sans-serif", 600, '12px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8.5vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.2rem 1.4rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.2rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '100px', cardLg: '12px', cardMd: '10px', cardSm: '8px', bar: '6px' },
    components: {
      cardTinted: { background: 'rgba(67,97,238,0.04)', border: '1px solid rgba(67,97,238,0.2)', borderRadius: '12px', padding: '1.5rem 1.6rem' },
      tagPill: { background: 'rgba(67,97,238,0.08)', color: '#4361ee', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '12px' },
      accentLine: { width: '60px', height: '4px', background: '#4361ee', borderRadius: '2px' },
      coverDecoration: { background: 'linear-gradient(180deg, #ffffff 55%, #4361ee 55%)', clipPath: 'none' },
    },
    decorativeStyle: 'color-split',
    meta: {
      label: 'Electric Studio', tagline: 'Clean white + electric blue split layout.',
      mood: ['modern', 'calm', 'trustworthy'], tone: ['clean', 'polished', 'neutral'],
      formality: 'medium-high', density: 'medium', scheme: 'light',
      bestFor: ['business', 'technical'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Serif SC', serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700',
      lineHeightBump: 1.2,
    },
  },

  'creative-voltage': {
    slug: 'creative-voltage',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&display=swap',
    displayFont: "'Syne', 'Noto Sans SC', sans-serif",
    bodyFont: "'Space Mono', 'Noto Sans SC', monospace",
    colors: {
      bg: '#1a1a2e',
      primary: '#d4ff00',
      text: '#ffffff',
      textMuted: 'rgba(255,255,255,0.7)',
      textLight: 'rgba(255,255,255,0.4)',
      accentLight: 'rgba(212,255,0,0.08)',
      accentMedium: 'rgba(212,255,0,0.15)',
      border: 'rgba(212,255,0,0.2)',
      cardBg: 'rgba(212,255,0,0.04)',
    },
    typography: {
      h1: ts("'Syne','Noto Sans SC',sans-serif", 800, 'clamp(42px,5vw,64px)', 1.05, '-0.02em'),
      h2: ts("'Syne','Noto Sans SC',sans-serif", 700, 'clamp(26px,3vw,40px)', 1.1, '-0.01em'),
      h3: ts("'Syne','Noto Sans SC',sans-serif", 700, 'clamp(16px,1.5vw,22px)', 1.3),
      h4Eyebrow: ts("'Space Mono','Noto Sans SC',monospace", 700, 'clamp(12px,1vw,14px)', 1.1, '0.06em', 'uppercase'),
      body: ts("'Space Mono','Noto Sans SC',monospace", 400, 'clamp(13px,1vw,16px)', 1.6),
      metricValue: ts("'Syne','Noto Sans SC',sans-serif", 800, 'clamp(34px,3.2vw,46px)', 1),
      metricLabel: ts("'Space Mono','Noto Sans SC',monospace", 700, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Syne','Noto Sans SC',sans-serif", 700, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Syne','Noto Sans SC',sans-serif", 700, 'clamp(24px,2.6vw,36px)', 1.3),
      tag: ts("'Space Mono','Noto Sans SC',monospace", 700, '11px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8.5vh',
      padCardLg: '1.4rem 1.5rem', padCardMd: '1.2rem 1.3rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.1rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '100px', cardLg: '0', cardMd: '0', cardSm: '0', bar: '0' },
    components: {
      cardTinted: { background: 'rgba(212,255,0,0.06)', border: '2px solid rgba(212,255,0,0.2)', borderRadius: '0', padding: '1.4rem 1.5rem' },
      tagPill: { background: 'rgba(212,255,0,0.12)', color: '#d4ff00', padding: '0.3rem 0.8rem', borderRadius: '0', fontSize: '11px' },
      accentLine: { width: '60px', height: '3px', background: '#d4ff00', borderRadius: '0' },
      coverDecoration: { background: 'rgba(0,102,255,0.5)', clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)' },
    },
    decorativeStyle: 'type-as-mass',
    meta: {
      label: 'Creative Voltage', tagline: 'Acid yellow on deep navy — high-voltage creative.',
      mood: ['electric', 'bold', 'graphic', 'design-led'], tone: ['loud', 'modern', 'intentional'],
      formality: 'medium', density: 'medium', scheme: 'dark',
      bestFor: ['creative', 'technical'],
      avoidFor: ['academic'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Serif SC', serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700',
      lineHeightBump: 1.2,
    },
  },

  'dark-botanical': {
    slug: 'dark-botanical',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500&family=Noto+Serif+SC:wght@400;500;700&display=swap',
    displayFont: "'Cormorant', 'Noto Serif SC', serif",
    bodyFont: "'IBM Plex Sans', 'Noto Serif SC', sans-serif",
    colors: {
      bg: '#0f0f0f',
      primary: '#d4a574',
      text: '#e8e4df',
      textMuted: 'rgba(232,228,223,0.6)',
      textLight: 'rgba(232,228,223,0.35)',
      accentLight: 'rgba(212,165,116,0.08)',
      accentMedium: 'rgba(212,165,116,0.15)',
      border: 'rgba(212,165,116,0.2)',
      cardBg: 'rgba(212,165,116,0.04)',
    },
    typography: {
      h1: ts("'Cormorant','Noto Serif SC',serif", 700, 'clamp(42px,5vw,64px)', 1.1),
      h2: ts("'Cormorant','Noto Serif SC',serif", 600, 'clamp(26px,3vw,40px)', 1.15),
      h3: ts("'IBM Plex Sans','Noto Serif SC',sans-serif", 400, 'clamp(17px,1.6vw,22px)', 1.3),
      h4Eyebrow: ts("'IBM Plex Sans','Noto Serif SC',sans-serif", 500, 'clamp(12px,1vw,15px)', 1.1, '0.1em', 'uppercase'),
      body: ts("'IBM Plex Sans','Noto Serif SC',sans-serif", 300, 'clamp(14px,1vw,17px)', 1.7),
      metricValue: ts("'Cormorant','Noto Serif SC',serif", 700, 'clamp(32px,3vw,44px)', 1),
      metricLabel: ts("'IBM Plex Sans','Noto Serif SC',sans-serif", 500, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Cormorant','Noto Serif SC',serif", 600, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Cormorant','Noto Serif SC',serif", 400, 'clamp(24px,2.6vw,36px)', 1.35),
      tag: ts("'IBM Plex Sans','Noto Serif SC',sans-serif", 500, '12px', 1),
    },
    spacing: {
      padSlideX: '5vw', padSlideYTop: '4vw', padSlideYBottom: '8vh',
      padCardLg: '1.8rem 2rem', padCardMd: '1.5rem 1.6rem',
      gapGridLg: '3.5rem', gapGridMd: '2.5rem 3rem', gapCards: '1.4rem',
      headerMargin: '3vh',
    },
    radii: { pill: '100px', cardLg: '4px', cardMd: '2px', cardSm: '0', bar: '0' },
    components: {
      cardTinted: { background: 'rgba(212,165,116,0.04)', border: '1px solid rgba(212,165,116,0.15)', borderRadius: '4px', padding: '1.8rem 2rem' },
      tagPill: { background: 'rgba(212,165,116,0.1)', color: '#d4a574', padding: '0.3rem 0.8rem', borderRadius: '2px', fontSize: '12px' },
      accentLine: { width: '40px', height: '2px', background: '#d4a574', borderRadius: '1px' },
    },
    decorativeStyle: 'hairline-rules',
    meta: {
      label: 'Dark Botanical', tagline: 'Dark canvas with warm gold accents and elegant serifs.',
      mood: ['editorial', 'quiet', 'elegant', 'warm'], tone: ['literary', 'considered', 'warm'],
      formality: 'medium-high', density: 'low', scheme: 'dark',
      bestFor: ['academic', 'business'],
    },
    cjk: {
      displayFont: "'Noto Serif SC', serif", bodyFont: "'Noto Serif SC', serif",
      fontsUrl: '&family=Noto+Serif+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },

  // ─── Light Themes ─────────────────────────────────────────────────────

  'notebook-tabs': {
    slug: 'notebook-tabs',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&family=DM+Sans:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    displayFont: "'Bodoni Moda', 'Noto Serif SC', serif",
    bodyFont: "'DM Sans', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#f8f6f1',
      primary: '#2d2d2d',
      text: '#1a1a1a',
      textMuted: 'rgba(26,26,26,0.55)',
      textLight: 'rgba(26,26,26,0.3)',
      accentLight: 'rgba(152,212,187,0.12)',
      accentMedium: 'rgba(152,212,187,0.2)',
      border: 'rgba(45,45,45,0.15)',
      cardBg: 'rgba(45,45,45,0.03)',
    },
    typography: {
      h1: ts("'Bodoni Moda','Noto Serif SC',serif", 700, 'clamp(40px,4.5vw,60px)', 1.05),
      h2: ts("'Bodoni Moda','Noto Serif SC',serif", 400, 'clamp(26px,2.8vw,38px)', 1.1),
      h3: ts("'DM Sans','Noto Sans SC',sans-serif", 500, 'clamp(16px,1.5vw,21px)', 1.3),
      h4Eyebrow: ts("'DM Sans','Noto Sans SC',sans-serif", 600, 'clamp(11px,1vw,14px)', 1.1, '0.08em', 'uppercase'),
      body: ts("'DM Sans','Noto Sans SC',sans-serif", 400, 'clamp(14px,1vw,17px)', 1.6),
      metricValue: ts("'Bodoni Moda','Noto Serif SC',serif", 700, 'clamp(32px,3vw,44px)', 1),
      metricLabel: ts("'DM Sans','Noto Sans SC',sans-serif", 500, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Bodoni Moda','Noto Serif SC',serif", 700, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Bodoni Moda','Noto Serif SC',serif", 400, 'clamp(24px,2.6vw,36px)', 1.3),
      tag: ts("'DM Sans','Noto Sans SC',sans-serif", 500, '12px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.3rem 1.4rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.2rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '100px', cardLg: '10px', cardMd: '8px', cardSm: '6px', bar: '4px' },
    components: {
      cardTinted: { background: 'rgba(45,45,45,0.03)', border: '1px solid rgba(45,45,45,0.12)', borderRadius: '10px', padding: '1.5rem 1.6rem' },
      tagPill: { background: 'rgba(152,212,187,0.12)', color: '#2d2d2d', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '12px' },
      accentLine: { width: '50px', height: '3px', background: '#98d4bb', borderRadius: '2px' },
    },
    decorativeStyle: 'tinted-cards',
    meta: {
      label: 'Notebook Tabs', tagline: 'Warm paper with sage accents and classic serif display.',
      mood: ['editorial', 'warm', 'considered'], tone: ['literary', 'quiet', 'tasteful'],
      formality: 'medium-high', density: 'medium', scheme: 'light',
      bestFor: ['academic', 'business'],
    },
    cjk: {
      displayFont: "'Noto Serif SC', serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },

  'pastel-geometry': {
    slug: 'pastel-geometry',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    displayFont: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif",
    bodyFont: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#faf9f7',
      primary: '#9b8dc4',
      text: '#1a1a1a',
      textMuted: 'rgba(26,26,26,0.55)',
      textLight: 'rgba(26,26,26,0.3)',
      accentLight: 'rgba(155,141,196,0.1)',
      accentMedium: 'rgba(155,141,196,0.18)',
      border: 'rgba(155,141,196,0.2)',
      cardBg: 'rgba(155,141,196,0.05)',
    },
    typography: {
      h1: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 800, 'clamp(38px,4.2vw,56px)', 1.1, '-0.02em'),
      h2: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 700, 'clamp(24px,2.6vw,36px)', 1.1, '-0.01em'),
      h3: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 600, 'clamp(16px,1.4vw,20px)', 1.3),
      h4Eyebrow: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 700, 'clamp(11px,1vw,14px)', 1.1, '0.08em', 'uppercase'),
      body: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 400, 'clamp(14px,1vw,16px)', 1.6),
      metricValue: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 800, 'clamp(30px,2.8vw,42px)', 1),
      metricLabel: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 600, 'clamp(13px,1.1vw,16px)', 1.3),
      statNum: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 700, 'clamp(22px,2vw,30px)', 1),
      blockquote: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 700, 'clamp(22px,2.4vw,34px)', 1.3),
      tag: ts("'Plus Jakarta Sans','Noto Sans SC',sans-serif", 600, '11px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.2rem 1.4rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.2rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '100px', cardLg: '16px', cardMd: '12px', cardSm: '8px', bar: '6px' },
    components: {
      cardTinted: { background: 'rgba(155,141,196,0.05)', border: '1px solid rgba(155,141,196,0.2)', borderRadius: '16px', padding: '1.5rem 1.6rem' },
      tagPill: { background: 'rgba(155,141,196,0.1)', color: '#9b8dc4', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '11px' },
      accentLine: { width: '50px', height: '4px', background: '#9b8dc4', borderRadius: '2px' },
    },
    decorativeStyle: 'dot-grid',
    meta: {
      label: 'Pastel Geometry', tagline: 'Soft pastels with geometric precision.',
      mood: ['calm', 'modern', 'warm'], tone: ['clean', 'approachable', 'soft'],
      formality: 'medium', density: 'medium', scheme: 'light',
      bestFor: ['business', 'creative'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },

  'split-pastel': {
    slug: 'split-pastel',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    displayFont: "'Outfit', 'Noto Sans SC', sans-serif",
    bodyFont: "'Outfit', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#ffffff',
      primary: '#c8f0d8',
      text: '#1a1a1a',
      textMuted: 'rgba(26,26,26,0.55)',
      textLight: 'rgba(26,26,26,0.3)',
      accentLight: 'rgba(200,240,216,0.15)',
      accentMedium: 'rgba(200,240,216,0.25)',
      border: 'rgba(200,240,216,0.3)',
      cardBg: 'rgba(200,240,216,0.08)',
    },
    typography: {
      h1: ts("'Outfit','Noto Sans SC',sans-serif", 800, 'clamp(38px,4.2vw,56px)', 1.1, '-0.02em'),
      h2: ts("'Outfit','Noto Sans SC',sans-serif", 700, 'clamp(24px,2.6vw,36px)', 1.1, '-0.01em'),
      h3: ts("'Outfit','Noto Sans SC',sans-serif", 600, 'clamp(16px,1.4vw,20px)', 1.3),
      h4Eyebrow: ts("'Outfit','Noto Sans SC',sans-serif", 700, 'clamp(11px,1vw,14px)', 1.1, '0.06em', 'uppercase'),
      body: ts("'Outfit','Noto Sans SC',sans-serif", 400, 'clamp(14px,1vw,17px)', 1.6),
      metricValue: ts("'Outfit','Noto Sans SC',sans-serif", 800, 'clamp(30px,2.8vw,42px)', 1),
      metricLabel: ts("'Outfit','Noto Sans SC',sans-serif", 600, 'clamp(13px,1.1vw,16px)', 1.3),
      statNum: ts("'Outfit','Noto Sans SC',sans-serif", 700, 'clamp(22px,2vw,30px)', 1),
      blockquote: ts("'Outfit','Noto Sans SC',sans-serif", 700, 'clamp(22px,2.4vw,34px)', 1.3),
      tag: ts("'Outfit','Noto Sans SC',sans-serif", 600, '11px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.2rem 1.4rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.2rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '100px', cardLg: '14px', cardMd: '10px', cardSm: '8px', bar: '6px' },
    components: {
      cardTinted: { background: 'rgba(200,240,216,0.08)', border: '1px solid rgba(200,240,216,0.25)', borderRadius: '14px', padding: '1.5rem 1.6rem' },
      tagPill: { background: 'rgba(200,240,216,0.15)', color: '#2d6b4a', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '11px' },
      accentLine: { width: '50px', height: '4px', background: '#c8f0d8', borderRadius: '2px' },
      coverDecoration: { background: 'linear-gradient(90deg, #f5e6dc 50%, #e4dff0 50%)', clipPath: 'none' },
    },
    decorativeStyle: 'color-split',
    meta: {
      label: 'Split Pastel', tagline: 'Warm peach and cool lavender split with mint accents.',
      mood: ['warm', 'playful', 'modern'], tone: ['upbeat', 'approachable', 'fresh'],
      formality: 'medium-low', density: 'medium', scheme: 'light',
      bestFor: ['creative'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },

  'vintage-editorial': {
    slug: 'vintage-editorial',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Work+Sans:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;700;900&display=swap',
    displayFont: "'Fraunces', 'Noto Serif SC', serif",
    bodyFont: "'Work Sans', 'Noto Serif SC', sans-serif",
    colors: {
      bg: '#f5f3ee',
      primary: '#1a1a1a',
      text: '#1a1a1a',
      textMuted: 'rgba(26,26,26,0.55)',
      textLight: 'rgba(26,26,26,0.3)',
      accentLight: 'rgba(232,212,192,0.2)',
      accentMedium: 'rgba(232,212,192,0.35)',
      border: 'rgba(26,26,26,0.12)',
      cardBg: 'rgba(26,26,26,0.03)',
    },
    typography: {
      h1: ts("'Fraunces','Noto Serif SC',serif", 900, 'clamp(42px,5vw,64px)', 1.05),
      h2: ts("'Fraunces','Noto Serif SC',serif", 700, 'clamp(26px,3vw,40px)', 1.1),
      h3: ts("'Work Sans','Noto Serif SC',sans-serif", 500, 'clamp(16px,1.5vw,21px)', 1.3),
      h4Eyebrow: ts("'Work Sans','Noto Serif SC',sans-serif", 600, 'clamp(11px,1vw,14px)', 1.1, '0.1em', 'uppercase'),
      body: ts("'Work Sans','Noto Serif SC',sans-serif", 400, 'clamp(14px,1vw,17px)', 1.65),
      metricValue: ts("'Fraunces','Noto Serif SC',serif", 900, 'clamp(34px,3.2vw,46px)', 1),
      metricLabel: ts("'Work Sans','Noto Serif SC',sans-serif", 600, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Fraunces','Noto Serif SC',serif", 700, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Fraunces','Noto Serif SC',serif", 700, 'clamp(24px,2.6vw,36px)', 1.3),
      tag: ts("'Work Sans','Noto Serif SC',sans-serif", 500, '12px', 1),
    },
    spacing: {
      padSlideX: '5vw', padSlideYTop: '4vw', padSlideYBottom: '8vh',
      padCardLg: '1.8rem 2rem', padCardMd: '1.5rem 1.6rem',
      gapGridLg: '3.5rem', gapGridMd: '2.5rem 3rem', gapCards: '1.4rem',
      headerMargin: '3vh',
    },
    radii: { pill: '100px', cardLg: '4px', cardMd: '2px', cardSm: '0', bar: '0' },
    components: {
      cardTinted: { background: 'rgba(26,26,26,0.03)', border: '1px solid rgba(26,26,26,0.1)', borderRadius: '4px', padding: '1.8rem 2rem' },
      tagPill: { background: 'rgba(232,212,192,0.2)', color: '#1a1a1a', padding: '0.3rem 0.8rem', borderRadius: '2px', fontSize: '12px' },
      accentLine: { width: '40px', height: '2px', background: '#1a1a1a', borderRadius: '1px' },
    },
    decorativeStyle: 'hairline-rules',
    meta: {
      label: 'Vintage Editorial', tagline: 'Warm paper with classic serif typography.',
      mood: ['editorial', 'warm', 'literary', 'considered'], tone: ['literary', 'thoughtful', 'warm'],
      formality: 'high', density: 'low', scheme: 'light',
      bestFor: ['academic', 'business'],
    },
    cjk: {
      displayFont: "'Noto Serif SC', serif", bodyFont: "'Noto Serif SC', serif",
      fontsUrl: '&family=Noto+Serif+SC:wght@400;500;700;900',
      lineHeightBump: 1.2,
    },
  },

  // ─── Specialty Themes ─────────────────────────────────────────────────

  'neon-cyber': {
    slug: 'neon-cyber',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;700&display=swap',
    displayFont: "'Archivo Black', 'Noto Sans SC', sans-serif",
    bodyFont: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#0a0f1c',
      primary: '#00ffcc',
      text: '#00ffcc',
      textMuted: 'rgba(0,255,204,0.6)',
      textLight: 'rgba(0,255,204,0.35)',
      accentLight: 'rgba(0,255,204,0.08)',
      accentMedium: 'rgba(0,255,204,0.15)',
      border: 'rgba(0,255,204,0.2)',
      cardBg: 'rgba(0,255,204,0.04)',
    },
    typography: {
      h1: ts("'Archivo Black','Noto Sans SC',sans-serif", 400, 'clamp(40px,4.5vw,60px)', 1.1, '-0.02em'),
      h2: ts("'Space Grotesk','Noto Sans SC',sans-serif", 700, 'clamp(26px,3vw,38px)', 1.1, '-0.02em'),
      h3: ts("'Space Grotesk','Noto Sans SC',sans-serif", 600, 'clamp(16px,1.5vw,22px)', 1.3),
      h4Eyebrow: ts("'Space Grotesk','Noto Sans SC',sans-serif", 600, 'clamp(12px,1vw,14px)', 1.1, '0.08em', 'uppercase'),
      body: ts("'Space Grotesk','Noto Sans SC',sans-serif", 400, 'clamp(13px,1vw,16px)', 1.6),
      metricValue: ts("'Archivo Black','Noto Sans SC',sans-serif", 400, 'clamp(34px,3.2vw,46px)', 1),
      metricLabel: ts("'Space Grotesk','Noto Sans SC',sans-serif", 600, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Space Grotesk','Noto Sans SC',sans-serif", 700, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Archivo Black','Noto Sans SC',sans-serif", 400, 'clamp(24px,2.6vw,36px)', 1.3),
      tag: ts("'Space Grotesk','Noto Sans SC',sans-serif", 500, '11px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8.5vh',
      padCardLg: '1.4rem 1.5rem', padCardMd: '1.2rem 1.3rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.1rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '100px', cardLg: '0', cardMd: '0', cardSm: '0', bar: '0' },
    components: {
      cardTinted: { background: 'rgba(0,255,204,0.04)', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '0', padding: '1.4rem 1.5rem' },
      tagPill: { background: 'rgba(0,255,204,0.08)', color: '#00ffcc', padding: '0.3rem 0.8rem', borderRadius: '0', fontSize: '11px' },
      accentLine: { width: '60px', height: '3px', background: '#00ffcc', borderRadius: '0' },
    },
    decorativeStyle: 'neon-glow',
    meta: {
      label: 'Neon Cyber', tagline: 'Glowing cyan on deep navy — cyberpunk aesthetics.',
      mood: ['energetic', 'futuristic', 'bold'], tone: ['electric', 'geeky', 'rebellious'],
      formality: 'low', density: 'medium', scheme: 'dark',
      bestFor: ['technical', 'creative'],
      avoidFor: ['academic', 'business'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;700',
      lineHeightBump: 1.2,
    },
  },

  'terminal-green': {
    slug: 'terminal-green',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    displayFont: "'JetBrains Mono', 'Noto Sans SC', monospace",
    bodyFont: "'JetBrains Mono', 'Noto Sans SC', monospace",
    colors: {
      bg: '#0d1117',
      primary: '#39d353',
      text: '#39d353',
      textMuted: 'rgba(57,211,83,0.6)',
      textLight: 'rgba(57,211,83,0.35)',
      accentLight: 'rgba(57,211,83,0.08)',
      accentMedium: 'rgba(57,211,83,0.15)',
      border: 'rgba(57,211,83,0.2)',
      cardBg: 'rgba(57,211,83,0.04)',
    },
    typography: {
      h1: ts("'JetBrains Mono','Noto Sans SC',monospace", 700, 'clamp(36px,4vw,54px)', 1.1, '-0.02em'),
      h2: ts("'JetBrains Mono','Noto Sans SC',monospace", 700, 'clamp(24px,2.6vw,36px)', 1.1, '-0.01em'),
      h3: ts("'JetBrains Mono','Noto Sans SC',monospace", 500, 'clamp(15px,1.4vw,20px)', 1.3),
      h4Eyebrow: ts("'JetBrains Mono','Noto Sans SC',monospace", 500, 'clamp(11px,0.9vw,13px)', 1.1, '0.06em', 'uppercase'),
      body: ts("'JetBrains Mono','Noto Sans SC',monospace", 400, 'clamp(12px,0.9vw,15px)', 1.7),
      metricValue: ts("'JetBrains Mono','Noto Sans SC',monospace", 700, 'clamp(30px,2.8vw,42px)', 1),
      metricLabel: ts("'JetBrains Mono','Noto Sans SC',monospace", 500, 'clamp(13px,1.1vw,16px)', 1.3),
      statNum: ts("'JetBrains Mono','Noto Sans SC',monospace", 700, 'clamp(22px,2vw,30px)', 1),
      blockquote: ts("'JetBrains Mono','Noto Sans SC',monospace", 700, 'clamp(22px,2.4vw,34px)', 1.3),
      tag: ts("'JetBrains Mono','Noto Sans SC',monospace", 400, '11px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8.5vh',
      padCardLg: '1.4rem 1.5rem', padCardMd: '1.1rem 1.2rem',
      gapGridLg: '2.5rem', gapGridMd: '1.8rem 2.2rem', gapCards: '1rem',
      headerMargin: '2vh',
    },
    radii: { pill: '0', cardLg: '0', cardMd: '0', cardSm: '0', bar: '0' },
    components: {
      cardTinted: { background: 'rgba(57,211,83,0.04)', border: '1px solid rgba(57,211,83,0.15)', borderRadius: '0', padding: '1.4rem 1.5rem' },
      tagPill: { background: 'rgba(57,211,83,0.08)', color: '#39d353', padding: '0.25rem 0.7rem', borderRadius: '0', fontSize: '11px' },
      accentLine: { width: '50px', height: '2px', background: '#39d353', borderRadius: '0' },
    },
    decorativeStyle: 'terminal-scan',
    meta: {
      label: 'Terminal Green', tagline: 'Matrix-style monospace on dark terminal.',
      mood: ['geeky', 'technical', 'minimal'], tone: ['precise', 'code-like', 'functional'],
      formality: 'low', density: 'high', scheme: 'dark',
      bestFor: ['technical'],
      avoidFor: ['academic', 'business'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },

  'swiss-modern': {
    slug: 'swiss-modern',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Nunito:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    displayFont: "'Archivo', 'Noto Sans SC', sans-serif",
    bodyFont: "'Nunito', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#ffffff',
      primary: '#ff3300',
      text: '#000000',
      textMuted: 'rgba(0,0,0,0.55)',
      textLight: 'rgba(0,0,0,0.3)',
      accentLight: 'rgba(255,51,0,0.08)',
      accentMedium: 'rgba(255,51,0,0.15)',
      border: 'rgba(0,0,0,0.12)',
      cardBg: 'rgba(0,0,0,0.02)',
    },
    typography: {
      h1: ts("'Archivo','Noto Sans SC',sans-serif", 800, 'clamp(42px,5vw,64px)', 1.05, '-0.03em'),
      h2: ts("'Archivo','Noto Sans SC',sans-serif", 800, 'clamp(26px,3vw,40px)', 1.05, '-0.02em'),
      h3: ts("'Archivo','Noto Sans SC',sans-serif", 700, 'clamp(16px,1.5vw,21px)', 1.3, '-0.01em'),
      h4Eyebrow: ts("'Archivo','Noto Sans SC',sans-serif", 700, 'clamp(11px,1vw,14px)', 1.1, '0.1em', 'uppercase'),
      body: ts("'Nunito','Noto Sans SC',sans-serif", 400, 'clamp(14px,1vw,17px)', 1.6),
      metricValue: ts("'Archivo','Noto Sans SC',sans-serif", 800, 'clamp(34px,3.2vw,46px)', 1),
      metricLabel: ts("'Nunito','Noto Sans SC',sans-serif", 600, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Archivo','Noto Sans SC',sans-serif", 700, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Archivo','Noto Sans SC',sans-serif", 800, 'clamp(24px,2.6vw,36px)', 1.3, '-0.02em'),
      tag: ts("'Archivo','Noto Sans SC',sans-serif", 700, '12px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.2rem 1.4rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.2rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '0', cardLg: '0', cardMd: '0', cardSm: '0', bar: '0' },
    components: {
      cardTinted: { background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '0', padding: '1.5rem 1.6rem' },
      tagPill: { background: '#ff3300', color: '#ffffff', padding: '0.3rem 0.8rem', borderRadius: '0', fontSize: '12px' },
      accentLine: { width: '60px', height: '4px', background: '#ff3300', borderRadius: '0' },
    },
    decorativeStyle: 'dot-grid',
    meta: {
      label: 'Swiss Modern', tagline: 'Grid-based red-on-white with International Typographic Style.',
      mood: ['confident', 'modern', 'precise', 'graphic'], tone: ['bold', 'minimal', 'structured'],
      formality: 'medium-high', density: 'high', scheme: 'light',
      bestFor: ['business', 'technical'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },

  'paper-ink': {
    slug: 'paper-ink',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Source+Serif+4:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;700&display=swap',
    displayFont: "'Cormorant Garamond', 'Noto Serif SC', serif",
    bodyFont: "'Source Serif 4', 'Noto Serif SC', serif",
    colors: {
      bg: '#faf9f7',
      primary: '#c41e3a',
      text: '#1a1a1a',
      textMuted: 'rgba(26,26,26,0.55)',
      textLight: 'rgba(26,26,26,0.3)',
      accentLight: 'rgba(196,30,58,0.08)',
      accentMedium: 'rgba(196,30,58,0.15)',
      border: 'rgba(26,26,26,0.1)',
      cardBg: 'rgba(26,26,26,0.02)',
    },
    typography: {
      h1: ts("'Cormorant Garamond','Noto Serif SC',serif", 700, 'clamp(42px,5vw,64px)', 1.05),
      h2: ts("'Cormorant Garamond','Noto Serif SC',serif", 600, 'clamp(26px,3vw,40px)', 1.1),
      h3: ts("'Source Serif 4','Noto Serif SC',serif", 500, 'clamp(16px,1.5vw,21px)', 1.35),
      h4Eyebrow: ts("'Source Serif 4','Noto Serif SC',serif", 600, 'clamp(11px,1vw,14px)', 1.1, '0.06em', 'uppercase'),
      body: ts("'Source Serif 4','Noto Serif SC',serif", 400, 'clamp(14px,1vw,17px)', 1.7),
      metricValue: ts("'Cormorant Garamond','Noto Serif SC',serif", 700, 'clamp(34px,3.2vw,46px)', 1),
      metricLabel: ts("'Source Serif 4','Noto Serif SC',serif", 600, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Cormorant Garamond','Noto Serif SC',serif", 600, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Cormorant Garamond','Noto Serif SC',serif", 400, 'clamp(24px,2.6vw,36px)', 1.35),
      tag: ts("'Source Serif 4','Noto Serif SC',serif", 500, '12px', 1),
    },
    spacing: {
      padSlideX: '5vw', padSlideYTop: '4vw', padSlideYBottom: '8vh',
      padCardLg: '1.8rem 2rem', padCardMd: '1.5rem 1.6rem',
      gapGridLg: '3.5rem', gapGridMd: '2.5rem 3rem', gapCards: '1.4rem',
      headerMargin: '3vh',
    },
    radii: { pill: '100px', cardLg: '0', cardMd: '0', cardSm: '0', bar: '0' },
    components: {
      cardTinted: { background: 'rgba(26,26,26,0.02)', border: '1px solid rgba(26,26,26,0.08)', borderRadius: '0', padding: '1.8rem 2rem' },
      tagPill: { background: 'rgba(196,30,58,0.08)', color: '#c41e3a', padding: '0.3rem 0.8rem', borderRadius: '0', fontSize: '12px' },
      accentLine: { width: '40px', height: '2px', background: '#c41e3a', borderRadius: '0' },
    },
    decorativeStyle: 'hairline-rules',
    meta: {
      label: 'Paper & Ink', tagline: 'Crimson accents on warm paper — bookish and refined.',
      mood: ['literary', 'quiet', 'elegant', 'warm'], tone: ['considered', 'editorial', 'classical'],
      formality: 'high', density: 'low', scheme: 'light',
      bestFor: ['academic'],
    },
    cjk: {
      displayFont: "'Noto Serif SC', serif", bodyFont: "'Noto Serif SC', serif",
      fontsUrl: '&family=Noto+Serif+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },

  // ─── Art-Style Themes ──────────────────────────────────────────────────

  'chinese-ink': {
    slug: 'chinese-ink',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap',
    displayFont: "'Noto Serif SC', serif",
    bodyFont: "'Noto Sans SC', sans-serif",
    colors: {
      bg: '#f7f3e9',
      primary: '#c23a2b',
      text: '#2c2c2c',
      textMuted: 'rgba(44,44,44,0.55)',
      textLight: 'rgba(44,44,44,0.35)',
      accentLight: 'rgba(194,58,43,0.08)',
      accentMedium: 'rgba(194,58,43,0.15)',
      border: 'rgba(194,58,43,0.2)',
      cardBg: 'rgba(194,58,43,0.04)',
    },
    typography: {
      h1: ts("'Noto Serif SC',serif", 900, 'clamp(40px,5vw,62px)', 1.2),
      h2: ts("'Noto Serif SC',serif", 700, 'clamp(26px,3vw,40px)', 1.25),
      h3: ts("'Noto Sans SC',sans-serif", 500, 'clamp(17px,1.6vw,22px)', 1.4),
      h4Eyebrow: ts("'Noto Sans SC',sans-serif", 700, 'clamp(12px,1vw,14px)', 1.1, '0.12em', 'uppercase'),
      body: ts("'Noto Sans SC',sans-serif", 400, 'clamp(14px,1.1vw,17px)', 1.7),
      metricValue: ts("'Noto Serif SC',serif", 900, 'clamp(34px,3.2vw,46px)', 1),
      metricLabel: ts("'Noto Sans SC',sans-serif", 500, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Noto Serif SC',serif", 700, 'clamp(24px,2.2vw,32px)', 1),
      blockquote: ts("'Noto Serif SC',serif", 400, 'clamp(24px,2.6vw,36px)', 1.4),
      tag: ts("'Noto Sans SC',sans-serif", 500, '12px', 1),
    },
    spacing: {
      padSlideX: '5vw', padSlideYTop: '4vw', padSlideYBottom: '9vh',
      padCardLg: '1.5rem 1.8rem', padCardMd: '1.3rem 1.5rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.2rem',
      headerMargin: '3vh',
    },
    radii: { pill: '2px', cardLg: '2px', cardMd: '2px', cardSm: '2px', bar: '1px' },
    components: {
      cardTinted: { background: 'rgba(194,58,43,0.04)', border: '1px solid rgba(194,58,43,0.15)', borderRadius: '2px', padding: '1.5rem 1.8rem' },
      tagPill: { background: 'rgba(194,58,43,0.08)', color: '#c23a2b', padding: '0.3rem 0.8rem', borderRadius: '2px', fontSize: '12px' },
      accentLine: { width: '50px', height: '2px', background: '#c23a2b', borderRadius: '1px' },
      coverDecoration: { background: 'rgba(194,58,43,0.05)', clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' },
    },
    decorativeStyle: 'hairline-rules',
    meta: {
      label: 'Chinese Ink', tagline: 'Rice paper and vermillion seal — classical Chinese aesthetic.',
      mood: ['elegant', 'traditional', 'serene', 'cultural'], tone: ['refined', 'contemplative', 'timeless'],
      formality: 'high', density: 'low', scheme: 'light',
      bestFor: ['academic', 'business'],
    },
    cjk: {
      displayFont: "'Noto Serif SC', serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@400;500;700',
      lineHeightBump: 1.25,
    },
  },

  'cinematic': {
    slug: 'cinematic',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600&family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    displayFont: "'Playfair Display', 'Noto Serif SC', serif",
    bodyFont: "'Inter', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#0a0a0a',
      primary: '#d4a843',
      text: '#f5f0e8',
      textMuted: 'rgba(245,240,232,0.6)',
      textLight: 'rgba(245,240,232,0.35)',
      accentLight: 'rgba(212,168,67,0.08)',
      accentMedium: 'rgba(212,168,67,0.15)',
      border: 'rgba(212,168,67,0.2)',
      cardBg: 'rgba(212,168,67,0.04)',
    },
    typography: {
      h1: ts("'Playfair Display','Noto Serif SC',serif", 900, 'clamp(42px,5vw,64px)', 1.05),
      h2: ts("'Playfair Display','Noto Serif SC',serif", 700, 'clamp(28px,3vw,42px)', 1.1),
      h3: ts("'Inter','Noto Sans SC',sans-serif", 500, 'clamp(17px,1.6vw,22px)', 1.3),
      h4Eyebrow: ts("'Inter','Noto Sans SC',sans-serif", 600, 'clamp(12px,1vw,15px)', 1.1, '0.1em', 'uppercase'),
      body: ts("'Inter','Noto Sans SC',sans-serif", 300, 'clamp(14px,1.1vw,17px)', 1.7),
      metricValue: ts("'Playfair Display','Noto Serif SC',serif", 700, 'clamp(34px,3.2vw,46px)', 1),
      metricLabel: ts("'Inter','Noto Sans SC',sans-serif", 500, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Playfair Display','Noto Serif SC',serif", 700, 'clamp(26px,2.4vw,34px)', 1),
      blockquote: ts("'Playfair Display','Noto Serif SC',serif", 700, 'clamp(26px,2.8vw,38px)', 1.3),
      tag: ts("'Inter','Noto Sans SC',sans-serif", 500, '12px', 1),
    },
    spacing: {
      padSlideX: '5vw', padSlideYTop: '7vh', padSlideYBottom: '7vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.3rem 1.4rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.2rem',
      headerMargin: '2vh',
    },
    radii: { pill: '4px', cardLg: '4px', cardMd: '4px', cardSm: '4px', bar: '2px' },
    components: {
      cardTinted: { background: 'rgba(212,168,67,0.04)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '4px', padding: '1.5rem 1.6rem' },
      tagPill: { background: 'rgba(212,168,67,0.1)', color: '#d4a843', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '12px' },
      accentLine: { width: '60px', height: '2px', background: '#d4a843', borderRadius: '1px' },
      coverDecoration: { background: 'linear-gradient(180deg, #0a0a0a 85%, #1a2744 85%)', clipPath: 'none' },
    },
    decorativeStyle: 'oversized-numeral',
    meta: {
      label: 'Cinematic', tagline: 'Golden amber on deep black — widescreen storytelling.',
      mood: ['dramatic', 'bold', 'premium', 'cinematic'], tone: ['theatrical', 'powerful', 'immersive'],
      formality: 'medium-high', density: 'low', scheme: 'dark',
      bestFor: ['creative', 'business'],
    },
    cjk: {
      displayFont: "'Noto Serif SC', serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },

  'neo-brutalist': {
    slug: 'neo-brutalist',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Space+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;700&display=swap',
    displayFont: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    bodyFont: "'Space Mono', 'Noto Sans SC', monospace",
    colors: {
      bg: '#f0f0ec',
      primary: '#ff2d6f',
      text: '#1a1a1a',
      textMuted: 'rgba(26,26,26,0.65)',
      textLight: 'rgba(26,26,26,0.4)',
      accentLight: 'rgba(255,45,111,0.08)',
      accentMedium: 'rgba(255,45,111,0.15)',
      border: 'rgba(26,26,26,0.3)',
      cardBg: '#ffffff',
    },
    typography: {
      h1: ts("'Space Grotesk','Noto Sans SC',sans-serif", 800, 'clamp(42px,5vw,64px)', 1.05, '-0.03em'),
      h2: ts("'Space Grotesk','Noto Sans SC',sans-serif", 800, 'clamp(28px,3vw,42px)', 1.1, '-0.02em'),
      h3: ts("'Space Grotesk','Noto Sans SC',sans-serif", 700, 'clamp(17px,1.6vw,22px)', 1.3),
      h4Eyebrow: ts("'Space Mono','Noto Sans SC',monospace", 700, 'clamp(12px,1vw,15px)', 1.1, '0.08em', 'uppercase'),
      body: ts("'Space Mono','Noto Sans SC',monospace", 400, 'clamp(13px,1vw,16px)', 1.6),
      metricValue: ts("'Space Grotesk','Noto Sans SC',sans-serif", 800, 'clamp(36px,3.4vw,48px)', 1),
      metricLabel: ts("'Space Mono','Noto Sans SC',monospace", 700, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Space Grotesk','Noto Sans SC',sans-serif", 800, 'clamp(26px,2.4vw,34px)', 1),
      blockquote: ts("'Space Grotesk','Noto Sans SC',sans-serif", 800, 'clamp(26px,2.8vw,38px)', 1.3),
      tag: ts("'Space Mono','Noto Sans SC',monospace", 700, '11px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.2rem 1.4rem',
      gapGridLg: '2.5rem', gapGridMd: '2rem 2rem', gapCards: '1rem',
      headerMargin: '2vh',
    },
    radii: { pill: '0', cardLg: '0', cardMd: '0', cardSm: '0', bar: '0' },
    components: {
      cardTinted: { background: '#ffffff', border: '3px solid #1a1a1a', borderRadius: '0', padding: '1.5rem 1.6rem' },
      tagPill: { background: '#ff2d6f', color: '#ffffff', padding: '0.3rem 0.8rem', borderRadius: '0', fontSize: '11px' },
      accentLine: { width: '80px', height: '4px', background: '#1a1a1a', borderRadius: '0' },
      coverDecoration: { background: '#ffe135', clipPath: 'polygon(0 0, 65% 0, 55% 100%, 0% 100%)' },
    },
    decorativeStyle: 'diagonal-hatch',
    meta: {
      label: 'Neo Brutalist', tagline: 'Hot pink, raw borders, zero curves — intentional chaos.',
      mood: ['bold', 'rebellious', 'graphic', 'loud'], tone: ['raw', 'provocative', 'unapologetic'],
      formality: 'low', density: 'high', scheme: 'light',
      bestFor: ['creative', 'technical'],
      avoidFor: ['academic'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;700',
      lineHeightBump: 1.15,
    },
  },

  'aurora': {
    slug: 'aurora',
    fontsUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    displayFont: "'Outfit', 'Noto Sans SC', sans-serif",
    bodyFont: "'DM Sans', 'Noto Sans SC', sans-serif",
    colors: {
      bg: '#0c1445',
      primary: '#00e5a0',
      text: '#e0f7ef',
      textMuted: 'rgba(224,247,239,0.6)',
      textLight: 'rgba(224,247,239,0.35)',
      accentLight: 'rgba(0,229,160,0.08)',
      accentMedium: 'rgba(0,229,160,0.15)',
      border: 'rgba(0,229,160,0.2)',
      cardBg: 'rgba(0,229,160,0.04)',
    },
    typography: {
      h1: ts("'Outfit','Noto Sans SC',sans-serif", 800, 'clamp(42px,5vw,64px)', 1.1, '-0.02em'),
      h2: ts("'Outfit','Noto Sans SC',sans-serif", 700, 'clamp(28px,3vw,42px)', 1.15, '-0.01em'),
      h3: ts("'DM Sans','Noto Sans SC',sans-serif", 500, 'clamp(17px,1.6vw,22px)', 1.3),
      h4Eyebrow: ts("'Outfit','Noto Sans SC',sans-serif", 600, 'clamp(12px,1vw,15px)', 1.1, '0.08em', 'uppercase'),
      body: ts("'DM Sans','Noto Sans SC',sans-serif", 400, 'clamp(14px,1.1vw,17px)', 1.6),
      metricValue: ts("'Outfit','Noto Sans SC',sans-serif", 700, 'clamp(34px,3.2vw,46px)', 1),
      metricLabel: ts("'DM Sans','Noto Sans SC',sans-serif", 600, 'clamp(14px,1.2vw,17px)', 1.3),
      statNum: ts("'Outfit','Noto Sans SC',sans-serif", 700, 'clamp(26px,2.4vw,34px)', 1),
      blockquote: ts("'Outfit','Noto Sans SC',sans-serif", 700, 'clamp(26px,2.8vw,38px)', 1.35),
      tag: ts("'DM Sans','Noto Sans SC',sans-serif", 500, '12px', 1),
    },
    spacing: {
      padSlideX: '4vw', padSlideYTop: '3.5vw', padSlideYBottom: '8.5vh',
      padCardLg: '1.5rem 1.6rem', padCardMd: '1.3rem 1.4rem',
      gapGridLg: '3rem', gapGridMd: '2rem 2.5rem', gapCards: '1.2rem',
      headerMargin: '2.5vh',
    },
    radii: { pill: '100px', cardLg: '16px', cardMd: '12px', cardSm: '8px', bar: '6px' },
    components: {
      cardTinted: { background: 'rgba(0,229,160,0.04)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: '16px', padding: '1.5rem 1.6rem' },
      tagPill: { background: 'rgba(0,229,160,0.1)', color: '#00e5a0', padding: '0.3rem 0.8rem', borderRadius: '100px', fontSize: '12px' },
      accentLine: { width: '60px', height: '3px', background: 'linear-gradient(90deg, #00e5a0, #8b5cf6)', borderRadius: '2px' },
      coverDecoration: { background: 'linear-gradient(135deg, rgba(0,229,160,0.3) 0%, rgba(139,92,246,0.3) 50%, rgba(244,114,182,0.3) 100%)', clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)' },
    },
    decorativeStyle: 'color-split',
    meta: {
      label: 'Aurora', tagline: 'Aurora borealis gradients on deep navy — ethereal glow.',
      mood: ['ethereal', 'mystical', 'futuristic', 'calm'], tone: ['luminous', 'dreamy', 'otherworldly'],
      formality: 'medium-low', density: 'medium', scheme: 'dark',
      bestFor: ['creative', 'technical'],
    },
    cjk: {
      displayFont: "'Noto Sans SC', sans-serif", bodyFont: "'Noto Sans SC', sans-serif",
      fontsUrl: '&family=Noto+Sans+SC:wght@400;500;700',
      lineHeightBump: 1.2,
    },
  },
}

// ── Public API ────────────────────────────────────────────────────────────

export function getDesignTokens(preset: StylePreset): DesignTokens {
  return designTokens[preset]
}

/** All design token presets as an array (for theme recommendation engine) */
export function getAllDesignTokens(): DesignTokens[] {
  return Object.values(designTokens)
}

// ── Legacy Compat ─────────────────────────────────────────────────────────
// Maps DesignTokens back to the old StyleConfig for existing consumers.

function tokensToLegacyConfig(tokens: DesignTokens): StyleConfig {
  const c = tokens.colors
  const isDark = tokens.meta.scheme === 'dark'

  return {
    label: tokens.meta.label,
    displayFont: tokens.displayFont,
    bodyFont: tokens.bodyFont,
    fontsUrl: tokens.fontsUrl,
    titleBg: c.bg,
    titleColor: isDark ? c.text : c.text,
    titleAccentBg: c.primary,
    titleAccentColor: isDark ? c.bg : '#ffffff',
    titleSubtitleColor: c.textMuted,
    contentBg: c.bg,
    contentHeaderBorder: c.primary,
    contentTitleColor: isDark ? c.text : c.text,
    contentBulletColor: c.textMuted,
    contentBulletDot: c.primary,
    contentNotesColor: c.textLight,
    dotActive: c.primary,
    dotInactive: c.textLight,
  }
}

export function getStyleConfig(preset: StylePreset): StyleConfig {
  return tokensToLegacyConfig(designTokens[preset])
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
  { value: 'paper-ink', label: 'Paper & Ink' },
  { value: 'chinese-ink', label: 'Chinese Ink' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'neo-brutalist', label: 'Neo Brutalist' },
  { value: 'aurora', label: 'Aurora' },
]
