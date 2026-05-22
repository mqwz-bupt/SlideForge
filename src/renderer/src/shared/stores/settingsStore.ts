import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

  /** Load encrypted apiKey from safe storage on app startup */
  loadEncryptedApiKey: () => Promise<void>
}

/** Encrypted API key stored in localStorage under this key */
const API_KEY_STORAGE_KEY = 'slideforge-api-key-encrypted'

/**
 * Custom storage that encrypts the apiKey via Electron safeStorage
 * while keeping other settings in plaintext localStorage.
 */
function createSecureStorage() {
  const memoryKey = { current: '' }

  return {
    getItem: (name: string): string | null => {
      const raw = localStorage.getItem(name)
      if (!raw) return null

      try {
        const parsed = JSON.parse(raw)
        // Restore apiKey from memory cache (populated on set)
        parsed.state = parsed.state || {}
        parsed.state.aiConfig = parsed.state.aiConfig || {}
        if (memoryKey.current) {
          parsed.state.aiConfig.apiKey = memoryKey.current
        }
        return JSON.stringify(parsed)
      } catch {
        return raw
      }
    },
    setItem: (name: string, value: string) => {
      try {
        const parsed = JSON.parse(value)
        const apiKey = parsed?.state?.aiConfig?.apiKey

        if (apiKey && apiKey.length > 0 && (window as any).api?.safeStore) {
          // Cache in memory for immediate reads
          memoryKey.current = apiKey

          // Encrypt and store asynchronously (fire-and-forget)
          ;(window as any).api.safeStore
            .set('apiKey', apiKey)
            .then((encrypted: string | null) => {
              if (encrypted) {
                localStorage.setItem(API_KEY_STORAGE_KEY, encrypted)
              }
            })
            .catch(() => {})

          // Don't store apiKey in plaintext
          parsed.state.aiConfig.apiKey = ''
          localStorage.setItem(name, JSON.stringify(parsed))
          return
        }
      } catch {
        // Fall through to default
      }
      localStorage.setItem(name, value)
    },
    removeItem: (name: string) => {
      localStorage.removeItem(name)
      localStorage.removeItem(API_KEY_STORAGE_KEY)
      memoryKey.current = ''
    }
  }
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
      getAIConfig: () => get().aiConfig,
      /** Load encrypted apiKey from safe storage on app startup */
      loadEncryptedApiKey: async () => {
        const encrypted = localStorage.getItem(API_KEY_STORAGE_KEY)
        if (!encrypted || !(window as any).api?.safeStore) return
        try {
          const decrypted = await (window as any).api.safeStore.get(encrypted)
          if (decrypted) {
            // Update the in-memory apiKey without triggering another encrypt cycle
            set((s) => ({ aiConfig: { ...s.aiConfig, apiKey: decrypted } }))
          }
        } catch {}
      }
    }),
    {
      name: 'slideforge-settings',
      storage: createJSONStorage(() => createSecureStorage())
    }
  )
)
