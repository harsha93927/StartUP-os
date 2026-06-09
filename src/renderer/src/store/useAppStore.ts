import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Project {
  name: string
  path: string
  description: string
}

interface AppState {
  workspacePath: string | null
  currentProject: Project | null
  setWorkspacePath: (path: string | null) => void
  setCurrentProject: (project: Project | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workspacePath: null,
      currentProject: null,
      setWorkspacePath: (path) => set({ workspacePath: path }),
      setCurrentProject: (project) => set({ currentProject: project }),
    }),
    {
      name: 'startup-os-storage',
    }
  )
)
