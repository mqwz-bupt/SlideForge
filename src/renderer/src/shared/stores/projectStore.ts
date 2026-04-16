import { create } from 'zustand'
import type { Project, RecentProject, ChatMessage, StylePreset, Section, Point, DocumentOutline, Slide } from '../types/project'
import { mockProject, mockRecentProjects, mockChatMessages } from '../mocks/projectData'

interface ProjectState {
  currentProject: Project | null
  recentProjects: RecentProject[]
  chatMessages: ChatMessage[]
  selectedStyle: StylePreset | null
  topic: string
  selectedMood: string | null
  selectedScopes: string[]
  uploadedFileName: string
  documentOutline: DocumentOutline | null

  setCurrentProject: (project: Project | null) => void
  addChatMessage: (message: ChatMessage) => void
  setSelectedStyle: (style: StylePreset | null) => void
  setTopic: (topic: string) => void
  setSelectedMood: (mood: string | null) => void
  toggleScope: (scope: string) => void
  setUploadedFileName: (name: string) => void
  setDocumentOutline: (outline: DocumentOutline | null) => void
  resetWizardState: () => void
  loadMockProject: () => void

  // Outline editing
  updateSectionTitle: (sectionId: string, title: string) => void
  updatePointContent: (sectionId: string, pointId: string, content: string) => void
  addSection: () => void
  deleteSection: (sectionId: string) => void
  addPoint: (sectionId: string) => void
  deletePoint: (sectionId: string, pointId: string) => void
  moveSectionUp: (sectionId: string) => void
  moveSectionDown: (sectionId: string) => void
  toggleSectionCollapse: (sectionId: string) => void

  // Slide editing
  addSlide: (afterSlideIndex: number, slide: Slide) => void

  // Persistence
  saveProject: () => Promise<void>
  loadProjectById: (id: string) => Promise<void>
  loadRecentProjects: () => Promise<void>
  deleteProjectById: (id: string) => Promise<void>
}

/** Helper: update sections immutably */
function mapSections(sections: Section[], sectionId: string, fn: (s: Section) => Section): Section[] {
  return sections.map((s) => s.id === sectionId ? fn(s) : s)
}

/** Helper: update slides that belong to a section */
function mapSlidesBySection(slides: import('../types/project').Slide[], sectionId: string, fn: (slide: import('../types/project').Slide) => import('../types/project').Slide) {
  return slides.map((sl) => sl.sectionId === sectionId ? fn(sl) : sl)
}

let nextId = 1000
function genId(prefix: string) {
  return `${prefix}-${++nextId}`
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  recentProjects: mockRecentProjects,
  chatMessages: [],
  selectedStyle: null,
  topic: '',
  selectedMood: null,
  selectedScopes: ['Core Concepts'],
  uploadedFileName: '',
  documentOutline: null,

  setCurrentProject: (project) => set({ currentProject: project }),
  addChatMessage: (message) => set((s) => ({ chatMessages: [...s.chatMessages, message] })),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setTopic: (topic) => set({ topic }),
  setSelectedMood: (mood) => set({ selectedMood: mood }),
  toggleScope: (scope) => set((s) => {
    const scopes = s.selectedScopes.includes(scope)
      ? s.selectedScopes.filter((x) => x !== scope)
      : [...s.selectedScopes, scope]
    return { selectedScopes: scopes }
  }),
  setUploadedFileName: (name) => set({ uploadedFileName: name }),
  setDocumentOutline: (outline) => set({ documentOutline: outline }),
  resetWizardState: () => set({
    topic: '',
    selectedMood: null,
    selectedStyle: null,
    selectedScopes: ['Core Concepts'],
    uploadedFileName: '',
    documentOutline: null,
    currentProject: null,
    chatMessages: []
  }),
  loadMockProject: () => set({
    currentProject: mockProject,
    chatMessages: mockChatMessages
  }),

  // === Outline editing ===
  updateSectionTitle: (sectionId, title) =>
    set((s) => {
      if (!s.currentProject) return s
      const newSections = mapSections(s.currentProject.documentOutline.sections, sectionId, (sec) => ({ ...sec, title }))
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: { ...s.currentProject.documentOutline, sections: newSections },
          slides: mapSlidesBySection(s.currentProject.slides, sectionId, (sl) => ({
            ...sl,
            content: { ...sl.content, title }
          }))
        }
      }
    }),

  updatePointContent: (sectionId, pointId, content) =>
    set((s) => {
      if (!s.currentProject) return s
      const newSections = mapSections(s.currentProject.documentOutline.sections, sectionId, (sec) => ({
        ...sec,
        points: sec.points.map((p) => p.id === pointId ? { ...p, content } : p)
      }))
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: { ...s.currentProject.documentOutline, sections: newSections }
        }
      }
    }),

  addSection: () =>
    set((s) => {
      if (!s.currentProject) return s
      const sections = s.currentProject.documentOutline.sections
      const newSection: Section = {
        id: genId('s'),
        order: sections.length + 1,
        title: 'New Section',
        points: [{ id: genId('p'), content: 'New point', type: 'bullet' }]
      }
      const newSlide: import('../types/project').Slide = {
        id: genId('slide'),
        order: s.currentProject.slides.length + 1,
        sectionId: newSection.id,
        layout: 'content',
        content: { title: newSection.title, body: newSection.points.map((p) => p.content) }
      }
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: {
            ...s.currentProject.documentOutline,
            sections: [...sections, newSection],
            totalPoints: s.currentProject.documentOutline.totalPoints + 1
          },
          slides: [...s.currentProject.slides, newSlide]
        }
      }
    }),

  deleteSection: (sectionId) =>
    set((s) => {
      if (!s.currentProject) return s
      const sections = s.currentProject.documentOutline.sections.filter((sec) => sec.id !== sectionId)
        .map((sec, i) => ({ ...sec, order: i + 1 }))
      const totalPoints = sections.reduce((sum, sec) => sum + sec.points.length, 0)
      const slides = s.currentProject.slides
        .filter((sl) => sl.sectionId !== sectionId)
        .map((sl, i) => ({ ...sl, order: i + 1 }))
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: { ...s.currentProject.documentOutline, sections, totalPoints },
          slides
        }
      }
    }),

  addPoint: (sectionId) =>
    set((s) => {
      if (!s.currentProject) return s
      const newSections = mapSections(s.currentProject.documentOutline.sections, sectionId, (sec) => ({
        ...sec,
        points: [...sec.points, { id: genId('p'), content: 'New point', type: 'bullet' as const }]
      }))
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: {
            ...s.currentProject.documentOutline,
            sections: newSections,
            totalPoints: s.currentProject.documentOutline.totalPoints + 1
          }
        }
      }
    }),

  deletePoint: (sectionId, pointId) =>
    set((s) => {
      if (!s.currentProject) return s
      const newSections = mapSections(s.currentProject.documentOutline.sections, sectionId, (sec) => ({
        ...sec,
        points: sec.points.filter((p) => p.id !== pointId)
      }))
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: {
            ...s.currentProject.documentOutline,
            sections: newSections,
            totalPoints: Math.max(0, s.currentProject.documentOutline.totalPoints - 1)
          }
        }
      }
    }),

  moveSectionUp: (sectionId) =>
    set((s) => {
      if (!s.currentProject) return s
      const sections = [...s.currentProject.documentOutline.sections]
      const idx = sections.findIndex((sec) => sec.id === sectionId)
      if (idx <= 0) return s
      ;[sections[idx - 1], sections[idx]] = [sections[idx], sections[idx - 1]]
      const reordered = sections.map((sec, i) => ({ ...sec, order: i + 1 }))
      // Reorder slides to match section order
      const sectionOrder = reordered.map((sec) => sec.id)
      const slides = [...s.currentProject.slides].sort((a, b) => {
        const ai = sectionOrder.indexOf(a.sectionId)
        const bi = sectionOrder.indexOf(b.sectionId)
        return (ai === bi ? a.order - b.order : ai - bi)
      }).map((sl, i) => ({ ...sl, order: i + 1 }))
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: { ...s.currentProject.documentOutline, sections: reordered },
          slides
        }
      }
    }),

  moveSectionDown: (sectionId) =>
    set((s) => {
      if (!s.currentProject) return s
      const sections = [...s.currentProject.documentOutline.sections]
      const idx = sections.findIndex((sec) => sec.id === sectionId)
      if (idx < 0 || idx >= sections.length - 1) return s
      ;[sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]]
      const reordered = sections.map((sec, i) => ({ ...sec, order: i + 1 }))
      const sectionOrder = reordered.map((sec) => sec.id)
      const slides = [...s.currentProject.slides].sort((a, b) => {
        const ai = sectionOrder.indexOf(a.sectionId)
        const bi = sectionOrder.indexOf(b.sectionId)
        return (ai === bi ? a.order - b.order : ai - bi)
      }).map((sl, i) => ({ ...sl, order: i + 1 }))
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: { ...s.currentProject.documentOutline, sections: reordered },
          slides
        }
      }
    }),

  toggleSectionCollapse: (sectionId) =>
    set((s) => {
      if (!s.currentProject) return s
      return {
        currentProject: {
          ...s.currentProject,
          documentOutline: {
            ...s.currentProject.documentOutline,
            sections: mapSections(s.currentProject.documentOutline.sections, sectionId, (sec) => ({
              ...sec,
              isCollapsed: !sec.isCollapsed
            }))
          }
        }
      }
    }),

  addSlide: (afterSlideIndex, slide) =>
    set((s) => {
      if (!s.currentProject) return s
      const slides = [...s.currentProject.slides]
      const insertAt = afterSlideIndex + 1
      slides.splice(insertAt, 0, slide)
      // Re-order all slides
      const reordered = slides.map((sl, i) => ({ ...sl, order: i + 1 }))
      return {
        currentProject: {
          ...s.currentProject,
          slides: reordered
        }
      }
    }),

  // === Persistence ===
  saveProject: async () => {
    const { currentProject } = get()
    if (!currentProject) return
    const api = (window as any).api
    await api.project.save(currentProject)
    // Refresh recent list
    await get().loadRecentProjects()
  },

  loadProjectById: async (id: string) => {
    const api = (window as any).api
    const result = await api.project.load(id)
    if (result.success && result.project) {
      set({ currentProject: result.project, chatMessages: [] })
    }
  },

  loadRecentProjects: async () => {
    const api = (window as any).api
    const result = await api.project.list()
    if (result.success) {
      set({ recentProjects: result.projects })
    }
  },

  deleteProjectById: async (id: string) => {
    const api = (window as any).api
    await api.project.delete(id)
    await get().loadRecentProjects()
  }
}))
