import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarOverlay: {
      color: '#000',
      height: 32,
      symbolColor: '#ccc'
    },
    titleBarStyle: 'hidden',
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

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC handler to find all markdown files
  ipcMain.handle('find-markdown-files', async (_, dirPath?: string) => {
    try {
      // Use provided directory or default to user's home directory
      const searchPath = dirPath || os.homedir()
      const markdownFiles = await findMarkdownFiles(searchPath)
      return { success: true, files: markdownFiles }
    } catch (error) {
      console.error('Error finding markdown files:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // IPC handler to read a file by path
  ipcMain.handle('read-file-by-path', async (_, filePath: string) => {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8')
      const fileName = path.basename(filePath)
      return { success: true, content, fileName }
    } catch (error) {
      console.error('Error reading file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // IPC handler to save a file
  ipcMain.handle('save-file', async (_, filePath: string, content: string) => {
    try {
      let dir = path.dirname(filePath)
      if (dir == '.' || dir == '') {
        dir = os.homedir() + '/.pandoc-editor'
      }
      if (!filePath.endsWith('.md')) {
        filePath += '.md'
      }
      // Ensure the directory exists
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      console.error('Error saving file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // IPC handler to get file tree structure
  ipcMain.handle(
    'get-file-tree',
    async (_, dirPath = path.join(os.homedir(), '.pandoc-editor')) => {
      try {
        const fileTree = await buildFileTree(dirPath, dirPath)
        return { success: true, tree: fileTree }
      } catch (error) {
        console.error('Error building file tree:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  )

  // IPC handler to update a markdown file
  ipcMain.handle('update-markdown-file', async (_, filePath: string, content: string) => {
    try {
      const dir = path.dirname(filePath)
      // Ensure the directory exists
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error) {
      console.error('Error saving file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Create the main window
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Function to recursively find all .md files
async function findMarkdownFiles(
  dirPath = path.join(os.homedir(), '.pandoc-editor')
): Promise<string[]> {
  const markdownFiles: string[] = []

  try {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true })

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name)

      if (item.isDirectory()) {
        // Skip common directories that typically don't contain user markdown files
        if (
          !['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'coverage'].includes(
            item.name
          )
        ) {
          const subFiles = await findMarkdownFiles(fullPath)
          markdownFiles.push(...subFiles)
        }
      } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.md') {
        markdownFiles.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
  }

  return markdownFiles
}

// Interface for file tree structure
interface FileTreeItem {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileTreeItem[]
}

// Function to recursively build file tree structure
async function buildFileTree(dirPath: string, basePath: string): Promise<FileTreeItem[]> {
  const tree: FileTreeItem[] = []

  try {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true })

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name)
      const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/')

      if (item.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', '.vscode', 'coverage'].includes(item.name)) {
          const children = await buildFileTree(fullPath, basePath)
          tree.push({
            name: item.name,
            type: 'folder',
            path: `/${relativePath}`,
            children
          })
        }
      } else if (item.isFile() && path.extname(item.name).toLowerCase() === '.md') {
        tree.push({
          name: item.name,
          type: 'file',
          path: `/${relativePath}`
        })
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error)
  }

  // Sort to have folders first, then files, alphabetically
  return tree.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
