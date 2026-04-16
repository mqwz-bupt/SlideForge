import { ThemeProvider as EmotionThemeProvider, Global, css } from '@emotion/react'
import React, { useMemo } from 'react'
import { getTheme, type Theme } from './index'
import { useSettingsStore } from '@/shared/stores/settingsStore'

declare module '@emotion/react' {
  export interface Theme {
    colors: Theme['colors']
    shadows: Theme['shadows']
    radius: Theme['radius']
    layout: Theme['layout']
    transition: string
    transitionSlow: string
  }
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSettingsStore((s) => s.theme)
  const activeTheme = useMemo(() => getTheme(mode), [mode])

  const globalStyles = useMemo(() => css`
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body, #root {
      height: 100%;
      overflow: hidden;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${activeTheme.colors.background};
      color: ${activeTheme.colors.textPrimary};
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${activeTheme.colors.border}; border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: ${activeTheme.colors.textMuted}; }
    button { font-family: inherit; cursor: pointer; }
    input, textarea, select { font-family: inherit; }
  `, [activeTheme])

  return (
    <EmotionThemeProvider theme={activeTheme}>
      <Global styles={globalStyles} />
      {children}
    </EmotionThemeProvider>
  )
}
