interface ElectronAPI {
  // Auth
  login: (credentials: any) => Promise<{ success: boolean; user?: { email: string }; error?: string }>
  register: (credentials: any) => Promise<{ success: boolean; user?: { email: string }; error?: string }>
  getProjects: (email: string) => Promise<{ success: boolean; projects: any[]; error?: string }>

  // Filesystem
  selectFolder: () => Promise<string | null>
  createProjectFolder: (workspacePath: string, projectName: string, projectDescription: string, userEmail: string) => Promise<{ success: boolean; path: string; error?: string }>
  saveReport: (projectPath: string, filename: string, content: string) => Promise<{ success: boolean; error?: string }>
  readJson: (projectPath: string, relativePath: string) => Promise<any>
  readText: (projectPath: string, relativePath: string) => Promise<string>
  writeJson: (projectPath: string, relativePath: string, data: any) => Promise<{ success: boolean; error?: string }>
  openPath: (path: string) => Promise<void>
  join: (...args: string[]) => Promise<string>

  // Search
  searchQuery: (query: { query: string }) => Promise<{ success: boolean; results: any[]; error?: string }>
  searchIndex: (data: { type: string, title: string, content: string }) => Promise<{ success: boolean; error?: string }>

  // AI
  setAiKey: (key: string) => Promise<boolean>
  aiChat: (payload: { messages: any[], model?: string }) => Promise<any>
}

interface Window {
  electron: any
  api: ElectronAPI
}
