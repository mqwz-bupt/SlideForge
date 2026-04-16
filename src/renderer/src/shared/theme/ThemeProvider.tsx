import { ThemeProvider as EmotionThemeProvider, Global, css } from '@emotion/react'
import React from 'react'
import { theme, type Theme } from './index'

const globalStyles = css`
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
    background: ${theme.colors.background};
    color: ${theme.colors.textPrimary};
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${theme.colors.border}; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: ${theme.colors.textMuted}; }
  button { font-family: inherit; cursor: pointer; }
  input, textarea, select { font-family: inherit; }
`

declare module '@emotion/react' {
  export interface Theme {
    colors: typeof theme.colors
    shadows: typeof theme.shadows
    radius: typeof theme.radius
    layout: typeof theme.layout
    transition: string
    transitionSlow: string
  }
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionThemeProvider theme={theme}>
      <Global styles={globalStyles} />
      {children}
    </EmotionThemeProvider>
  )
}
