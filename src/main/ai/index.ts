// AI IPC handlers — bridges renderer ↔ AI adapter

import { ipcMain, BrowserWindow } from 'electron'
import { OpenAICompatibleAdapter } from './adapter'
import { PROVIDER_PRESETS } from './types'
import type { AIProviderConfig, ChatMessage } from './types'

let adapter: OpenAICompatibleAdapter | null = null

function getAdapter(config: AIProviderConfig): OpenAICompatibleAdapter {
  if (adapter && adapter.config.apiKey === config.apiKey && adapter.config.baseURL === config.baseURL) {
    return adapter
  }
  adapter = new OpenAICompatibleAdapter(config)
  return adapter
}

export function registerAIIPC() {
  // Test API key connection
  ipcMain.handle('ai:test-key', async (_event, config: AIProviderConfig) => {
    const a = getAdapter(config)
    return a.testConnection()
  })

  // Non-streaming chat
  ipcMain.handle('ai:chat', async (_event, config: AIProviderConfig, messages: ChatMessage[], options?: { temperature?: number; max_tokens?: number }) => {
    const a = getAdapter(config)
    return a.chat({ messages, ...options })
  })

  // Streaming chat — sends chunks back via event
  ipcMain.handle('ai:chat-stream', async (event, config: AIProviderConfig, messages: ChatMessage[], options?: { temperature?: number; max_tokens?: number }) => {
    const a = getAdapter(config)
    const sender = event.sender
    let fullContent = ''

    try {
      for await (const chunk of a.chatStream({ messages, ...options })) {
        fullContent += chunk
        sender.send('ai:stream:chunk', chunk)
      }
      sender.send('ai:stream:done', fullContent)
      return { content: fullContent }
    } catch (err: any) {
      sender.send('ai:stream:error', err.message)
      throw err
    }
  })

  // Get available provider presets
  ipcMain.handle('ai:providers', () => {
    return PROVIDER_PRESETS
  })
}
