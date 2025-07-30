import icon from '../../resources/icon.png?asset'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { app, shell, dialog, BrowserWindow, ipcMain, nativeTheme, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { ensurePandocInstalled } from './install-pandoc'
import { buildFileTree, findMarkdownFiles, getDefaultPath, getFilePath } from './filesystem'
import matter from 'gray-matter'
import type { PandocOptions } from '../preload/types'
import * as pandoc from './pandoc'

function createWindow(): BrowserWindow {
  const isDarkMode = nativeTheme.shouldUseDarkColors
  const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900 / scaleFactor,
    height: 670 / scaleFactor,
    show: false,
    icon: path.join(app.getAppPath(), 'resources', isDarkMode ? 'icon-dark.png' : 'icon-light.png'),
    autoHideMenuBar: true,
    frame: false, // Remove the default frame for custom styling
    // transparent: true, // Enable transparency for rounded corners
    titleBarOverlay: {
      color: isDarkMode ? '#222' : '#ccc',
      height: Math.round(34 / scaleFactor),
      symbolColor: isDarkMode ? '#ccc': '#000'
    },
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      zoomFactor: 1 / scaleFactor, // Compensate for display scaling
    }
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  console.log(screen.getPrimaryDisplay().scaleFactor);


  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.amarjay')

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
      filePath = await getFilePath(filePath)
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

  // IPC hander to fetch default path
  ipcMain.handle('get-default-path', () => {
    try {
      const path = getDefaultPath()
      return {
        success: true,
        path
      }
    } catch (error) {
      console.error('Error fetching default path:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // IPC handler to save a file
  ipcMain.handle('save-file', async (_, filePath: string, content: string) => {
    try {
      filePath = await getFilePath(filePath, true)
      // Ensure the directory exists
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

  // IPC handler for frontmatter handling
  ipcMain.handle('gray-matter', async (_, content: string) => {
    try {
      const result = matter(content)
      return { success: true, ...result }
    } catch (error) {
      console.error('Error processing frontmatter:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // IPC to handle frontmatter parsing
  ipcMain.handle(
    'reverse-gray-matter',
    async (_, content: string, frontmatter: Record<string, unknown>) => {
      try {
        const frontmatterContent = matter.stringify(content, frontmatter)
        return { success: true, content: frontmatterContent }
      } catch (error) {
        console.error('Error reversing frontmatter:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  )

  // IPC handler to get file tree structure
  ipcMain.handle('get-file-tree', async (_, dirPath = getDefaultPath()) => {
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
  })

  // IPC handler to update a markdown file
  ipcMain.handle('update-markdown-file', async (_, filePath: string, content: string) => {
    try {
      filePath = await getFilePath(filePath, true)
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

  ipcMain.handle('show-alert', async (_, message: string, type = 'info') => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (!focusedWindow) {
      console.error('No focused window to show alert')
      return
    }
    dialog.showMessageBox(focusedWindow, {
      type: type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message: message,
      buttons: ['OK']
    })
  })

  // open a file
  ipcMain.handle('open-file', async (_, filePath: string) => {
    try {
      filePath = await getFilePath(filePath)
      console.log('file path', filePath)
      if (fs.existsSync(filePath)) {
        shell.openPath(filePath)
        return { success: true }
      } else {
        return { success: false, error: 'File does not exist ' + filePath }
      }
    } catch (error) {
      console.error('Error opening file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // File picker dialog
  ipcMain.handle('show-open-dialog', async () => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      if (!focusedWindow) {
        return { success: false, error: 'No focused window available' }
      }

      const defaultPath = getDefaultPath()
      const defaultFile = path.join(defaultPath, 'README.md')
      console.log('THE DEFAULT PATH IS', defaultFile)
      const result = await dialog.showOpenDialog(focusedWindow, {
        defaultPath: defaultFile,
        properties: ['openFile'],
        filters: [
          { name: 'Markdown Files', extensions: ['md', 'markdown', 'mdown', 'mkdn', 'mdx'] },
          { name: 'LaTeX Files (not supported yet)', extensions: ['tex', 'latex', 'tx'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePaths.length) {
        return { success: false, canceled: true }
      }

      return { success: true, filePath: result.filePaths[0] }
    } catch (error) {
      console.error('Error showing open dialog:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Ensure Pandoc is installed
  ensurePandocInstalled()

  // Pandoc conversion IPC handlers
  ipcMain.handle(
    'pandoc-convert',
    async (_, inputPath: string, outputPath?: string, options?: Partial<PandocOptions>) => {
      try {
        const result = await pandoc.convertWithPandoc(inputPath, outputPath, options)
        return result
      } catch (error) {
        console.error('Pandoc conversion error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  )

  ipcMain.handle(
    'pandoc-to-pdf',
    async (_, inputPath: string, outputPath?: string, options?: Partial<PandocOptions>) => {
      try {
        const result = await pandoc.convertToPDF(inputPath, outputPath, options)
        return result
      } catch (error) {
        console.error('PDF conversion error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  )

  ipcMain.handle(
    'pandoc-to-html',
    async (_, inputPath: string, outputPath?: string, options?: Partial<PandocOptions>) => {
      try {
        const result = await pandoc.convertToHTML(inputPath, outputPath, options)
        return result
      } catch (error) {
        console.error('HTML conversion error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  )

  ipcMain.handle(
    'pandoc-to-latex',
    async (_, inputPath: string, outputPath?: string, options?: Partial<PandocOptions>) => {
      try {
        const result = await pandoc.convertToLaTeX(inputPath, outputPath, options)
        return result
      } catch (error) {
        console.error('LaTeX conversion error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  )

  ipcMain.handle(
    'pandoc-to-docx',
    async (_, inputPath: string, outputPath?: string, options?: Partial<PandocOptions>) => {
      try {
        const result = await pandoc.convertToDOCX(inputPath, outputPath, options)
        return result
      } catch (error) {
        console.error('DOCX conversion error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  )

  ipcMain.handle(
    'pandoc-to-epub',
    async (_, inputPath: string, outputPath?: string, options?: Partial<PandocOptions>) => {
      try {
        const result = await pandoc.convertToEPUB(inputPath, outputPath, options)
        return result
      } catch (error) {
        console.error('EPUB conversion error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }
    }
  )

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
