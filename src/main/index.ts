import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs-extra'
import axios from 'axios'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

let NVIDIA_API_KEY = ''
const USERS_FILE = join(app.getPath('userData'), 'users.json')

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Ensure users file exists
  if (!fs.existsSync(USERS_FILE)) {
    fs.ensureDirSync(app.getPath('userData'))
    fs.writeJsonSync(USERS_FILE, [])
  }

  // IPC Handlers for Auth
  ipcMain.handle('auth:register', async (_, { email, password }) => {
    try {
      const users = await fs.readJson(USERS_FILE)
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'User already exists' }
      }
      users.push({ email, password })
      await fs.writeJson(USERS_FILE, users)
      return { success: true, user: { email } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:login', async (_, { email, password }) => {
    try {
      const users = await fs.readJson(USERS_FILE)
      const user = users.find(u => u.email === email && u.password === password)
      if (!user) {
        return { success: false, error: 'Invalid email or password' }
      }
      return { success: true, user: { email } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Other IPC Handlers
  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle('fs:createProjectFolder', async (_, { workspacePath, projectName, projectDescription }) => {
    const projectPath = join(workspacePath, projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase())
    const folders = ['Reports', 'Roadmaps', 'Assets', 'Memory', 'Attachments', 'Exports']

    try {
      await fs.ensureDir(projectPath)
      for (const folder of folders) {
        await fs.ensureDir(join(projectPath, folder))
      }

      const projectData = {
        name: projectName,
        description: projectDescription,
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        status: 'planning',
        path: projectPath
      }
      await fs.writeJson(join(projectPath, 'project.json'), projectData, { spaces: 2 })

      const memoryData = {
        facts: [], competitors: [], risks: [], opportunities: [], decisions: [], roadmaps: [], milestones: [], reports: []
      }
      await fs.writeJson(join(projectPath, 'Memory', 'memory.json'), memoryData, { spaces: 2 })

      return { success: true, path: projectPath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('fs:saveReport', async (_, { projectPath, filename, content }) => {
    try {
      const filePath = join(projectPath, 'Reports', filename)
      await fs.writeFile(filePath, content, 'utf8')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('fs:readJson', async (_, { projectPath, relativePath }) => {
    try {
      const filePath = join(projectPath, relativePath)
      return await fs.readJson(filePath)
    } catch (error: any) {
      throw new Error(error.message)
    }
  })

  ipcMain.handle('fs:writeJson', async (_, { projectPath, relativePath, data }) => {
    try {
      const filePath = join(projectPath, relativePath)
      await fs.writeJson(filePath, data, { spaces: 2 })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('fs:openPath', async (_, path) => {
    shell.openPath(path)
  })

  ipcMain.handle('path:join', async (_, ...args) => {
    return join(...args)
  })

  ipcMain.handle('ai:setKey', (_, key) => {
    NVIDIA_API_KEY = key
    return true
  })

  ipcMain.handle('ai:chat', async (_, { messages, model = 'meta/llama-3.1-405b-instruct' }) => {
    if (!NVIDIA_API_KEY) throw new Error('API Key not set')

    try {
      const response = await axios.post(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        {
          model,
          messages,
          temperature: 0.2,
          top_p: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error: any) {
      console.error('AI Chat Error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || error.message)
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
