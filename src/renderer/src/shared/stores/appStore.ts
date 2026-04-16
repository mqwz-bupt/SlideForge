import { create } from 'zustand'
import type { ViewMode, WizardStep } from '../types/project'

interface AppState {
  currentView: ViewMode
  currentWizardStep: WizardStep
  sidebarCollapsed: boolean
  chatCollapsed: boolean
  activeSectionId: string | null
  activeSlideIndex: number
  activePointIndex: number | null

  setCurrentView: (view: ViewMode) => void
  setWizardStep: (step: WizardStep) => void
  toggleSidebar: () => void
  toggleChat: () => void
  setActiveSectionId: (id: string | null) => void
  setActiveSlideIndex: (index: number) => void
  setActivePointIndex: (index: number | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'wizard',
  currentWizardStep: 0,
  sidebarCollapsed: false,
  chatCollapsed: false,
  activeSectionId: null,
  activeSlideIndex: 0,
  activePointIndex: null,

  setCurrentView: (view) => set({ currentView: view }),
  setWizardStep: (step) => set({ currentWizardStep: step }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleChat: () => set((s) => ({ chatCollapsed: !s.chatCollapsed })),
  setActiveSectionId: (id) => set({ activeSectionId: id }),
  setActiveSlideIndex: (index) => set({ activeSlideIndex: index }),
  setActivePointIndex: (index) => set({ activePointIndex: index })
}))
