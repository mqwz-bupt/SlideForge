import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AIConfig {
  provider: 'deepseek' | 'qwen' | 'glm'
  apiKey: string
  model: string
  baseURL: string
}

export const PROVIDER_PRESETS: Record<string, { model: string; baseURL: string; label: string }> = {
  deepseek: {
    label: 'DeepSeek',
    model: 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1'
  },
  qwen: {
    label: 'Qwen (通义千问)',
    model: 'qwen-plus',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  glm: {
    label: 'GLM-4 (智谱)',
    model: 'glm-4-flash',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4'
  }
}

interface SettingsState {
  language: 'en' | 'zh'
  theme: 'light' | 'dark'
  aiConfig: AIConfig
  settingsOpen: boolean

  setLanguage: (lang: 'en' | 'zh') => void
  setTheme: (theme: 'light' | 'dark') => void
  setAIConfig: (config: Partial<AIConfig>) => void
  setSettingsOpen: (open: boolean) => void

  /** Get the full AI config for API calls */
  getAIConfig: () => AIConfig
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'zh',
      theme: 'light',
      aiConfig: {
        provider: 'deepseek',
        apiKey: '',
        model: 'deepseek-chat',
        baseURL: 'https://api.deepseek.com/v1'
      },
      settingsOpen: false,

      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setAIConfig: (config) =>
        set((s) => ({
          aiConfig: { ...s.aiConfig, ...config }
        })),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      getAIConfig: () => get().aiConfig
    }),
    { name: 'slideforge-settings' }
  )
)
