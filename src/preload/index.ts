import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  createProjectFolder: (workspacePath: string, projectName: string, projectDescription: string) =>
    ipcRenderer.invoke('fs:createProjectFolder', { workspacePath, projectName, projectDescription }),
  setAiKey: (key: string) => ipcRenderer.invoke('ai:setKey', key),
  aiChat: (payload: { messages: any[], model?: string }) => ipcRenderer.invoke('ai:chat', payload),
  saveReport: (projectPath: string, filename: string, content: string) =>
    ipcRenderer.invoke('fs:saveReport', { projectPath, filename, content }),
  readJson: (projectPath: string, relativePath: string) =>
    ipcRenderer.invoke('fs:readJson', { projectPath, relativePath }),
  writeJson: (projectPath: string, relativePath: string, data: any) =>
    ipcRenderer.invoke('fs:writeJson', { projectPath, relativePath, data })
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
