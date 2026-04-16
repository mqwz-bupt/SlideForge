import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppThemeProvider } from '@/shared/theme/ThemeProvider'
import { AppLayout } from '@/layout/AppLayout'
import { WizardView } from '@/features/wizard/WizardView'
import { EditorView } from '@/features/editor/EditorView'
import { SettingsDialog } from '@/features/settings/SettingsDialog'

export function App() {
  return (
    <AppThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<WizardView />} />
            <Route path="/editor" element={<EditorView />} />
          </Route>
        </Routes>
      </HashRouter>
      <SettingsDialog />
    </AppThemeProvider>
  )
}
