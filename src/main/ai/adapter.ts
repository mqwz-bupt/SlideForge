// OpenAI-compatible API adapter — works for DeepSeek, Qwen, GLM, OpenAI

import type { AIProviderConfig, ChatParams, ChatResult } from './types'

export class OpenAICompatibleAdapter {
  private _config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this._config = config
  }

  updateConfig(config: AIProviderConfig) {
    this._config = config
  }

  get config() {
    return this._config
  }

  /** Non-streaming chat completion */
  async chat(params: ChatParams): Promise<ChatResult> {
    const response = await fetch(`${this._config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.apiKey}`
      },
      body: JSON.stringify({
        model: this._config.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens ?? 4096,
        stream: false
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API Error ${response.status}: ${errText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    }
  }

  /** Streaming chat completion — yields content chunks */
  async *chatStream(params: ChatParams): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this._config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this._config.apiKey}`
      },
      body: JSON.stringify({
        model: this._config.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens ?? 4096,
        stream: true
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`API Error ${response.status}: ${errText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) yield delta
        } catch {
          // skip malformed chunks
        }
      }
    }
  }

  /** Test if the API key is valid by making a minimal request */
  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.chat({
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      })
      return { ok: true }
    } catch (err: any) {
      return { ok: false, error: err.message }
    }
  }
}
