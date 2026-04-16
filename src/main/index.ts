import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerAIIPC } from './ai/index'
import { generateHTML } from './export/html'
import { generatePPTX } from './export/pptx'
import { generatePDF } from './export/pdf'
import { initDatabase, saveProject, loadProject, listProjects, deleteProject } from './storage/database'

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

  // File IPC: open file dialog and read text content
  ipcMain.handle('file:open-text', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Text Documents', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const filePath = result.filePaths[0]
    const content = await readFile(filePath, 'utf-8')
    const name = filePath.split(/[/\\]/).pop() || 'unknown'
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
      const buffer = generatePPTX(project)
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
