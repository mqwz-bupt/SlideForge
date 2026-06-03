import { createRoot } from 'react-dom/client'
import React from 'react'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null }
  static getDerivedStateFromError(err: Error) {
    return { error: err.message + '\n\n' + (err.stack || '') }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: '#c00', fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 13, background: '#fff', height: '100vh' }}>
          <h2 style={{ marginBottom: 16 }}>Render Error:</h2>
          {this.state.error}
        </div>
      )
    }
    return this.props.children
  }
}

async function boot() {
  try {
    const [{ App }, , , ] = await Promise.all([
      import('./App'),
      import('@/shared/i18n')
    ])
    const root = createRoot(document.getElementById('root')!)
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )
  } catch (err: any) {
    document.getElementById('root')!.innerHTML =
      `<div style="padding:32px;color:#c00;font-family:monospace;white-space:pre-wrap;font-size:13px;background:#fff;height:100vh">
        <h2>Boot Error:</h2>${err.message}\n\n${err.stack || ''}
      </div>`
  }
}

boot()
