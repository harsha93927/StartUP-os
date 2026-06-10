import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Auth
  login: (credentials: any) => ipcRenderer.invoke('auth:login', credentials),
  register: (credentials: any) => ipcRenderer.invoke('auth:register', credentials),

  // Filesystem
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  createProjectFolder: (workspacePath: string, projectName: string, projectDescription: string, userEmail: string) =>
    ipcRenderer.invoke('fs:createProjectFolder', { workspacePath, projectName, projectDescription, userEmail }),
  saveReport: (projectPath: string, filename: string, content: string) =>
    ipcRenderer.invoke('fs:saveReport', { projectPath, filename, content }),
  readJson: (projectPath: string, relativePath: string) =>
    ipcRenderer.invoke('fs:readJson', { projectPath, relativePath }),
  writeJson: (projectPath: string, relativePath: string, data: any) =>
    ipcRenderer.invoke('fs:writeJson', { projectPath, relativePath, data }),
  openPath: (path: string) => ipcRenderer.invoke('fs:openPath', path),
  join: (...args: string[]) => ipcRenderer.invoke('path:join', ...args),

  // AI
  setAiKey: (key: string) => ipcRenderer.invoke('ai:setKey', key),
  aiChat: (payload: { messages: any[], model?: string }) => ipcRenderer.invoke('ai:chat', payload)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
