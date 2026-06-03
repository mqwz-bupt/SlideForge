import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppThemeProvider } from '@/shared/theme/ThemeProvider'
import { AppLayout } from '@/layout/AppLayout'
import { WizardView } from '@/features/wizard/WizardView'
import { EditorView } from '@/features/editor/EditorView'
import { SettingsDialog } from '@/features/settings/SettingsDialog'
import { useSettingsStore } from '@/shared/stores/settingsStore'

export function App() {
  const { i18n } = useTranslation()
  const language = useSettingsStore((s) => s.language)
  const loadEncryptedApiKey = useSettingsStore((s) => s.loadEncryptedApiKey)

  useEffect(() => { i18n.changeLanguage(language) }, [language, i18n])

  // Load encrypted API key from safe storage on startup
  useEffect(() => { loadEncryptedApiKey() }, [loadEncryptedApiKey])

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
