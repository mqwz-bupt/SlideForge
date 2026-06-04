import { app, shell, BrowserWindow, ipcMain, dialog, safeStorage } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerAIIPC } from './ai/index'
import { generateHTML } from './export/html'
import { generatePPTX } from './export/pptx'
import { generatePDF } from './export/pdf'
import { initDatabase, saveProject, loadProject, listProjects, deleteProject } from './storage/database'

/** Lazy-loaded PDF text extraction */
async function parsePDF(buf: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buf)
  return data.text
}

/** Lazy-loaded DOCX text extraction */
async function parseDOCX(buf: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer: buf })
  return result.value
}

function getExt(filePath: string): string {
  return filePath.split('.').pop()?.toLowerCase() || ''
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    autoHideMenuBar: true,
    title: 'SlideForge',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.slideforge')
  initDatabase()
  registerAIIPC()

  // File IPC: open file dialog and read text content (supports txt, md, pdf, docx)
  ipcMain.handle('file:open-text', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Documents', extensions: ['txt', 'md', 'pdf', 'docx'] },
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'Word', extensions: ['docx'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const filePath = result.filePaths[0]
    const name = filePath.split(/[/\\]/).pop() || 'unknown'
    const ext = getExt(filePath)

    let content: string
    if (ext === 'pdf') {
      const buf = await readFile(filePath)
      content = await parsePDF(buf)
    } else if (ext === 'docx') {
      const buf = await readFile(filePath)
      content = await parseDOCX(buf)
    } else {
      content = await readFile(filePath, 'utf-8')
    }

    return { name, content, path: filePath }
  })

  // File IPC: open image dialog and return as base64 data URL
  ipcMain.handle('file:open-image', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const filePath = result.filePaths[0]
    const ext = filePath.split('.').pop()?.toLowerCase() || 'png'
    const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
    const buf = await readFile(filePath)
    const dataUrl = `data:${mime};base64,${buf.toString('base64')}`
    const name = filePath.split(/[/\\]/).pop() || 'unknown'
    return { name, dataUrl }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // === Export IPC handlers ===

  ipcMain.handle('export:html', async (_event, project: any) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export HTML',
        filters: [{ name: 'HTML', extensions: ['html'] }],
        defaultPath: `${project.name || 'presentation'}.html`
      })
      if (result.canceled || !result.filePath) return { success: false, error: 'Cancelled' }
      const html = generateHTML(project)
      await writeFile(result.filePath, html, 'utf-8')
      return { success: true, path: result.filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('export:pptx', async (_event, project: any) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export PPTX',
        filters: [{ name: 'PowerPoint', extensions: ['pptx'] }],
        defaultPath: `${project.name || 'presentation'}.pptx`
      })
      if (result.canceled || !result.filePath) return { success: false, error: 'Cancelled' }
      const buffer = await generatePPTX(project)
      await writeFile(result.filePath, buffer)
      return { success: true, path: result.filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('export:pdf', async (_event, project: any) => {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export PDF',
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
        defaultPath: `${project.name || 'presentation'}.pdf`
      })
      if (result.canceled || !result.filePath) return { success: false, error: 'Cancelled' }
      const buffer = await generatePDF(project)
      await writeFile(result.filePath, buffer)
      return { success: true, path: result.filePath }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  // === Project persistence IPC handlers ===

  // Safe storage for sensitive data (API keys) using Electron safeStorage
  ipcMain.handle('safe-store:get', (_event, key: string) => {
    try {
      const buf = safeStorage.decryptString(Buffer.from(key, 'base64'))
      return buf.toString()
    } catch {
      return null
    }
  })

  ipcMain.handle('safe-store:set', (_event, _key: string, value: string) => {
    try {
      const encrypted = safeStorage.encryptString(value)
      return encrypted.toString('base64')
    } catch {
      return null
    }
  })

  ipcMain.handle('project:save', (_event, project: any) => {
    try {
      saveProject(project)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('project:load', (_event, id: string) => {
    try {
      const project = loadProject(id)
      return { success: true, project }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('project:list', () => {
    try {
      const projects = listProjects()
      return { success: true, projects }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('project:delete', (_event, id: string) => {
    try {
      deleteProject(id)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
