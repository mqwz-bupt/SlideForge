export const theme = {
  colors: {
    primary: '#6750A4',
    primaryLight: '#E8DEF8',
    primaryHover: '#7E65C1',
    primaryContainer: '#F0E8FF',
    background: '#F8F7FB',
    surface: '#FFFFFF',
    border: '#E6E6F0',
    hover: '#EFEFF6',
    textPrimary: '#1A1A2E',
    textSecondary: '#666680',
    textMuted: '#9999AA',
    accent: '#FF5722',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.06)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
    xl: '0 8px 40px rgba(0,0,0,0.12)'
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '50%'
  },
  layout: {
    toolbarHeight: '52px',
    sidebarWidth: '220px',
    outlineWidth: '280px',
    chatHeight: '220px',
    chatExpandedHeight: '280px'
  },
  transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  transitionSlow: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
} as const

export type Theme = typeof theme
