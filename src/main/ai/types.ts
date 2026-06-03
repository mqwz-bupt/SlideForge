// AI adapter types — shared between main process modules

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatParams {
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
}

export interface ChatResult {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIProviderConfig {
  provider: 'deepseek' | 'qwen' | 'glm' | 'openai'
  apiKey: string
  model: string
  baseURL: string
}

export const PROVIDER_PRESETS: Record<string, Omit<AIProviderConfig, 'apiKey'>> = {
  deepseek: {
    provider: 'deepseek',
    model: 'deepseek-chat',
    baseURL: 'https://api.deepseek.com/v1'
  },
  qwen: {
    provider: 'qwen',
    model: 'qwen-plus',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  glm: {
    provider: 'glm',
    model: 'glm-4-flash',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4'
  }
}
