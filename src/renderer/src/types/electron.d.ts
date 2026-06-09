interface ElectronAPI {
  selectFolder: () => Promise<string | null>
  createProjectFolder: (workspacePath: string, projectName: string, projectDescription: string) => Promise<{ success: boolean; path: string; error?: string }>
  setAiKey: (key: string) => Promise<boolean>
  aiChat: (payload: { messages: any[], model?: string }) => Promise<any>
  saveReport: (projectPath: string, filename: string, content: string) => Promise<{ success: boolean; error?: string }>
  readJson: (projectPath: string, relativePath: string) => Promise<any>
  writeJson: (projectPath: string, relativePath: string, data: any) => Promise<{ success: boolean; error?: string }>
}

interface Window {
  electron: any
  api: ElectronAPI
}
