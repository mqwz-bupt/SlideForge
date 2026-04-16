import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  file: {
    /** Open file dialog and read text content */
    openText: () => ipcRenderer.invoke('file:open-text'),
    /** Open image dialog and return as base64 data URL */
    openImage: () => ipcRenderer.invoke('file:open-image')
  },
  export: {
    /** Export presentation as HTML file */
    exportHTML: (project: any) => ipcRenderer.invoke('export:html', project),
    /** Export presentation as PPTX file */
    exportPPTX: (project: any) => ipcRenderer.invoke('export:pptx', project),
    /** Export presentation as PDF file */
    exportPDF: (project: any) => ipcRenderer.invoke('export:pdf', project)
  },
  project: {
    /** Save project to local database */
    save: (project: any) => ipcRenderer.invoke('project:save', project),
    /** Load project from local database */
    load: (id: string) => ipcRenderer.invoke('project:load', id),
    /** List recent projects */
    list: () => ipcRenderer.invoke('project:list'),
    /** Delete a project */
    delete: (id: string) => ipcRenderer.invoke('project:delete', id)
  },
  ai: {
    /** Test if an API key is valid */
    testKey: (config: {
      provider: string
      apiKey: string
      model: string
      baseURL: string
    }) => ipcRenderer.invoke('ai:test-key', config),

    /** Non-streaming chat completion */
    chat: (
      config: { provider: string; apiKey: string; model: string; baseURL: string },
      messages: { role: string; content: string }[],
      options?: { temperature?: number; max_tokens?: number }
    ) => ipcRenderer.invoke('ai:chat', config, messages, options),

    /** Streaming chat completion */
    chatStream: (
      config: { provider: string; apiKey: string; model: string; baseURL: string },
      messages: { role: string; content: string }[],
      options?: { temperature?: number; max_tokens?: number }
    ) => ipcRenderer.invoke('ai:chat-stream', config, messages, options),

    /** Listen for streaming chunks */
    onStreamChunk: (callback: (chunk: string) => void) => {
      const handler = (_event: any, chunk: string) => callback(chunk)
      ipcRenderer.on('ai:stream:chunk', handler)
      return () => ipcRenderer.removeListener('ai:stream:chunk', handler)
    },

    /** Listen for stream completion */
    onStreamDone: (callback: (fullContent: string) => void) => {
      const handler = (_event: any, content: string) => callback(content)
      ipcRenderer.on('ai:stream:done', handler)
      return () => ipcRenderer.removeListener('ai:stream:done', handler)
    },

    /** Listen for stream errors */
    onStreamError: (callback: (error: string) => void) => {
      const handler = (_event: any, error: string) => callback(error)
      ipcRenderer.on('ai:stream:error', handler)
      return () => ipcRenderer.removeListener('ai:stream:error', handler)
    },

    /** Get available provider presets */
    getProviders: () => ipcRenderer.invoke('ai:providers')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
