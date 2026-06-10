import { app, shell, BrowserWindow, ipcMain, dialog, safeStorage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs-extra'
import axios from 'axios'
import bcrypt from 'bcryptjs'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#000000',
      height: 32
    },
    title: 'Startup OS',
    icon: join(__dirname, '../../build/icon.ico'),
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

// Portable DB Implementation
const DB_DIR = app.getPath('userData')
const USERS_FILE = join(DB_DIR, 'users_db.json')
const PROJECTS_FILE = join(DB_DIR, 'projects_db.json')
const SETTINGS_FILE = join(DB_DIR, 'settings_db.json')

const initDB = () => {
  fs.ensureDirSync(DB_DIR)
  if (!fs.existsSync(USERS_FILE)) fs.writeJsonSync(USERS_FILE, [])
  if (!fs.existsSync(PROJECTS_FILE)) fs.writeJsonSync(PROJECTS_FILE, [])
  if (!fs.existsSync(SETTINGS_FILE)) fs.writeJsonSync(SETTINGS_FILE, {})
}
initDB()

let NVIDIA_API_KEY = ''

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.startupos.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Load encrypted key
  try {
    const settings = fs.readJsonSync(SETTINGS_FILE)
    if (settings.nvidia_api_key && safeStorage.isEncryptionAvailable()) {
      NVIDIA_API_KEY = safeStorage.decryptString(Buffer.from(settings.nvidia_api_key, 'base64'))
    }
  } catch (err) {
    console.error('Failed to load key:', err)
  }

  // Auth IPC Handlers
  ipcMain.handle('auth:register', async (_, { email, password }) => {
    try {
      const users = await fs.readJson(USERS_FILE)
      if (users.find(u => u.email === email)) return { success: false, error: 'User already exists' }

      const hashedPassword = await bcrypt.hash(password, 10)
      users.push({ email, password: hashedPassword, created_at: new Date().toISOString() })
      await fs.writeJson(USERS_FILE, users)
      return { success: true, user: { email } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:login', async (_, { email, password }) => {
    try {
      const users = await fs.readJson(USERS_FILE)
      const user = users.find(u => u.email === email)
      if (!user) return { success: false, error: 'Invalid email or password' }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) return { success: false, error: 'Invalid email or password' }

      return { success: true, user: { email: user.email } }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:getProjects', async (_, email) => {
    try {
      const projects = await fs.readJson(PROJECTS_FILE)
      const userProjects = projects.filter(p => p.user_email === email)
      return { success: true, projects: userProjects }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Search IPC Handlers (In-memory fallback for portability)
  let searchIndex: any[] = []
  ipcMain.handle('search:query', async (_, { query }) => {
    const q = query.toLowerCase()
    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(q) || item.content.toLowerCase().includes(q)
    ).map(item => ({
      type: item.type,
      title: item.title,
      snippet: item.content.substring(0, 60) + '...'
    }))
    return { success: true, results: results.slice(0, 10) }
  })

  ipcMain.handle('search:index', async (_, { type, title, content }) => {
    searchIndex = searchIndex.filter(i => i.title !== title)
    searchIndex.push({ type, title, content })
    return { success: true }
  })

  // Project IPC Handlers
  ipcMain.handle('fs:createProjectFolder', async (_, { workspacePath, projectName, projectDescription, userEmail }) => {
    const projectPath = join(workspacePath, projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase())
    const folders = ['Reports', 'Roadmaps', 'Assets', 'Memory', 'Attachments', 'Exports']

    try {
      await fs.ensureDir(projectPath)
      for (const folder of folders) await fs.ensureDir(join(projectPath, folder))

      const projects = await fs.readJson(PROJECTS_FILE)
      projects.push({
        user_email: userEmail,
        name: projectName,
        path: projectPath,
        description: projectDescription,
        created_at: new Date().toISOString()
      })
      await fs.writeJson(PROJECTS_FILE, projects)

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

  // Filesystem Helpers
  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return canceled ? null : filePaths[0]
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
      return await fs.readJson(join(projectPath, relativePath))
    } catch (error: any) {
      throw new Error(error.message)
    }
  })

  ipcMain.handle('fs:writeJson', async (_, { projectPath, relativePath, data }) => {
    try {
      await fs.writeJson(join(projectPath, relativePath), data, { spaces: 2 })
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

  // AI Provider
  ipcMain.handle('ai:setKey', async (_, key) => {
    NVIDIA_API_KEY = key
    if (safeStorage.isEncryptionAvailable()) {
       const encrypted = safeStorage.encryptString(key)
       const settings = await fs.readJson(SETTINGS_FILE)
       settings.nvidia_api_key = encrypted.toString('base64')
       await fs.writeJson(SETTINGS_FILE, settings)
    }
    return true
  })

  ipcMain.handle('ai:chat', async (_, { messages, model = 'meta/llama-3.1-405b-instruct' }) => {
    if (!NVIDIA_API_KEY) throw new Error('API Key not set')
    try {
      const response = await axios.post(
        'https://integrate.api.nvidia.com/v1/chat/completions',
        { model, messages, temperature: 0.2, top_p: 0.7, max_tokens: 2048 },
        { headers: { 'Authorization': `Bearer ${NVIDIA_API_KEY}`, 'Content-Type': 'application/json' } }
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
  if (process.platform !== 'darwin') app.quit()
})
