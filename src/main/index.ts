import { app, shell, BrowserWindow, ipcMain, dialog, safeStorage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs-extra'
import axios from 'axios'
import Database from 'better-sqlite3'
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

// Database Setup
const dbPath = join(app.getPath('userData'), 'startup-os.db')
const db = new Database(dbPath)

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users(email)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value BLOB NOT NULL
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS project_search USING fts5(
    project_path,
    type,
    title,
    content
  );
`)

let NVIDIA_API_KEY = ''

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.startupos.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  fs.ensureDirSync(app.getPath('userData'))

  // Load encrypted key
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('nvidia_api_key') as any
    if (row && safeStorage.isEncryptionAvailable()) {
      NVIDIA_API_KEY = safeStorage.decryptString(row.value)
    }
  } catch (err) {
    console.error('Failed to load encrypted key:', err)
  }

  // Auth IPC Handlers
  ipcMain.handle('auth:register', async (_, { email, password }) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)')
      stmt.run(email, hashedPassword)
      return { success: true, user: { email } }
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, error: 'Email already exists' }
      }
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:login', async (_, { email, password }) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
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
      const projects = db.prepare('SELECT * FROM projects WHERE user_email = ?').all(email)
      return { success: true, projects }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Search IPC Handler (FTS5)
  ipcMain.handle('search:query', async (_, { projectPath, query }) => {
    try {
      const results = db.prepare(`
        SELECT type, title, snippet(project_search, 3, '...', '...', '...', 10) as snippet
        FROM project_search
        WHERE project_path = ? AND project_search MATCH ?
      `).all(projectPath, query)
      return { success: true, results }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('search:index', async (_, { projectPath, type, title, content }) => {
    try {
      const indexTransaction = db.transaction(() => {
        db.prepare('DELETE FROM project_search WHERE project_path = ? AND title = ?').run(projectPath, title)
        db.prepare('INSERT INTO project_search (project_path, type, title, content) VALUES (?, ?, ?, ?)').run(projectPath, type, title, content)
      })
      indexTransaction()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Project IPC Handlers
  ipcMain.handle('fs:createProjectFolder', async (_, { workspacePath, projectName, projectDescription, userEmail }) => {
    const projectPath = join(workspacePath, projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase())
    const folders = ['Reports', 'Roadmaps', 'Assets', 'Memory', 'Attachments', 'Exports']

    const createTransaction = db.transaction(async () => {
      await fs.ensureDir(projectPath)
      for (const folder of folders) {
        await fs.ensureDir(join(projectPath, folder))
      }

      db.prepare('INSERT INTO projects (user_email, name, path, description) VALUES (?, ?, ?, ?)')
        .run(userEmail, projectName, projectPath, projectDescription)

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

      db.prepare('INSERT INTO project_search (project_path, type, title, content) VALUES (?, ?, ?, ?)').run(projectPath, 'project', projectName, projectDescription)
    })

    try {
      await createTransaction()
      return { success: true, path: projectPath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Filesystem Helpers
  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
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

  // AI Provider with Encryption
  ipcMain.handle('ai:setKey', (_, key) => {
    NVIDIA_API_KEY = key
    if (safeStorage.isEncryptionAvailable()) {
       const encrypted = safeStorage.encryptString(key)
       db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('nvidia_api_key', encrypted)
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
