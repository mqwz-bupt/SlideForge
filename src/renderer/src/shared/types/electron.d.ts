export {}

declare global {
  interface Window {
    api: {
      file: {
      openText: () => Promise<{ name: string; content: string; path: string } | null>
    }
    ai: {
        testKey: (config: {
          provider: string
          apiKey: string
          model: string
          baseURL: string
        }) => Promise<{ ok: boolean; error?: string }>

        chat: (
          config: {
            provider: string
            apiKey: string
            model: string
            baseURL: string
          },
          messages: { role: string; content: string }[],
          options?: { temperature?: number; max_tokens?: number }
        ) => Promise<{ content: string; usage?: any }>

        chatStream: (
          config: {
            provider: string
            apiKey: string
            model: string
            baseURL: string
          },
          messages: { role: string; content: string }[],
          options?: { temperature?: number; max_tokens?: number }
        ) => Promise<{ content: string }>

        onStreamChunk: (callback: (chunk: string) => void) => () => void
        onStreamDone: (callback: (fullContent: string) => void) => () => void
        onStreamError: (callback: (error: string) => void) => () => void

        getProviders: () => Promise<
          Record<string, { provider: string; model: string; baseURL: string }>
        >
      }
    }
  }
}
