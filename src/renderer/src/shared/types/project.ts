// Data models from PRD Section 10

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  documentOutline: DocumentOutline
  style: StylePreset
  slides: Slide[]
  sourceFiles: SourceFile[]
  metadata: ProjectMetadata
}

export interface DocumentOutline {
  sections: Section[]
  totalPoints: number
  estimatedMinutes: number
}

export interface Section {
  id: string
  order: number
  title: string
  points: Point[]
  isCollapsed?: boolean
}

export interface Point {
  id: string
  content: string
  type: 'bullet' | 'note' | 'emphasis' | 'data'
  subPoints?: string[]
}

export interface Slide {
  id: string
  order: number
  sectionId: string
  layout: SlideLayout
  content: SlideContent
  notes?: string
}

export type SlideLayout = 'title' | 'content' | 'two-column' | 'feature-grid' | 'quote' | 'blank' | 'section-divider' | 'highlight' | 'image'

export interface SlideContent {
  title: string
  subtitle?: string
  body?: string[]
  accent?: string
  imageUrl?: string
  highlight?: string
  leftTitle?: string
  leftBody?: string[]
  rightTitle?: string
  rightBody?: string[]
}

export type StylePreset =
  | 'bold-signal'
  | 'electric-studio'
  | 'creative-voltage'
  | 'dark-botanical'
  | 'notebook-tabs'
  | 'pastel-geometry'
  | 'split-pastel'
  | 'vintage-editorial'
  | 'neon-cyber'
  | 'terminal-green'
  | 'swiss-modern'
  | 'paper-ink'

export interface SourceFile {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'pptx' | 'txt' | 'md'
  size: number
  uploadedAt: string
}

export interface ProjectMetadata {
  language: 'zh' | 'en'
  mood?: 'confident' | 'excited' | 'calm' | 'inspired'
  scope?: string[]
  model?: string
}

export type ViewMode = 'wizard' | 'editor'

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}

export interface RecentProject {
  id: string
  name: string
  style: StylePreset
  slideCount: number
  updatedAt: string
}
