import type { Project, RecentProject } from './project'

export {}

type AIConfig = {
  provider: string
  apiKey: string
  model: string
  baseURL: string
}

type AIMessage = { role: string; content: string }

declare global {
  interface Window {
    api: {
      file: {
        openText: () => Promise<{ name: string; content: string; path: string } | null>
        openImage: () => Promise<{ name: string; dataUrl: string } | null>
      }
      export: {
        exportHTML: (project: Project) => Promise<{ success: boolean; path?: string; error?: string }>
        exportPPTX: (project: Project) => Promise<{ success: boolean; path?: string; error?: string }>
        exportPDF: (project: Project) => Promise<{ success: boolean; path?: string; error?: string }>
      }
      project: {
        save: (project: Project) => Promise<{ success: boolean; error?: string }>
        load: (id: string) => Promise<{ success: boolean; project?: Project | null; error?: string }>
        list: () => Promise<{ success: boolean; projects: RecentProject[]; error?: string }>
        delete: (id: string) => Promise<{ success: boolean; error?: string }>
      }
      safeStore: {
        get: (key: string) => Promise<string | null>
        set: (key: string, value: string) => Promise<string | null>
      }
      ai: {
        testKey: (config: AIConfig) => Promise<{ ok: boolean; error?: string }>
        chat: (
          config: AIConfig,
          messages: AIMessage[],
          options?: { temperature?: number; max_tokens?: number }
        ) => Promise<{ content: string; usage?: unknown }>
        chatStream: (
          config: AIConfig,
          messages: AIMessage[],
          options?: { temperature?: number; max_tokens?: number }
        ) => Promise<{ content: string }>
        onStreamChunk: (callback: (chunk: string) => void) => () => void
        onStreamDone: (callback: (fullContent: string) => void) => () => void
        onStreamError: (callback: (error: string) => void) => () => void
        getProviders: () => Promise<Record<string, { provider: string; model: string; baseURL: string }>>
      }
    }
  }
}
