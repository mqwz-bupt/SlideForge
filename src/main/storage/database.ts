import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'
import { mkdirSync } from 'fs'

let db: Database.Database | null = null

export function initDatabase(): void {
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'slideforge.db')

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
}

function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

export function saveProject(project: { id: string; name: string; createdAt: string; updatedAt: string; [k: string]: any }): void {
  const d = getDb()
  const data = JSON.stringify(project)
  d.prepare(`
    INSERT INTO projects (id, name, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=?, data=?, updated_at=?
  `).run(project.id, project.name, data, project.createdAt, project.updatedAt,
         project.name, data, project.updatedAt)
}

export function loadProject(id: string): any | null {
  const d = getDb()
  const row = d.prepare('SELECT data FROM projects WHERE id = ?').get(id) as { data: string } | undefined
  if (!row) return null
  return JSON.parse(row.data)
}

export interface RecentProjectRow {
  id: string
  name: string
  style: string
  slideCount: number
  updatedAt: string
}

export function listProjects(): RecentProjectRow[] {
  const d = getDb()
  const rows = d.prepare('SELECT id, name, data, updated_at FROM projects ORDER BY updated_at DESC').all() as { id: string; name: string; data: string; updated_at: string }[]
  return rows.map(row => {
    const parsed = JSON.parse(row.data)
    return {
      id: row.id,
      name: row.name,
      style: parsed.style ?? 'bold-signal',
      slideCount: parsed.slides?.length ?? 0,
      updatedAt: row.updated_at
    }
  })
}

export function deleteProject(id: string): void {
  const d = getDb()
  d.prepare('DELETE FROM projects WHERE id = ?').run(id)
}
