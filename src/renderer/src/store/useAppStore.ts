import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  email: string
  name?: string
}

interface Project {
  name: string
  path: string
  description: string
}

interface AppState {
  user: User | null
  workspacePath: string | null
  currentProject: Project | null
  setUser: (user: User | null) => void
  setWorkspacePath: (path: string | null) => void
  setCurrentProject: (project: Project | null) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      workspacePath: null,
      currentProject: null,
      setUser: (user) => set({ user }),
      setWorkspacePath: (path) => set({ workspacePath: path }),
      setCurrentProject: (project) => set({ currentProject: project }),
      logout: () => set({ user: null, currentProject: null }),
    }),
    {
      name: 'startup-os-storage-v2',
    }
  )
)
