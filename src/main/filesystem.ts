import path from 'path'
import os from 'os'
import fs from 'fs'

export const getDefaultPath = () => {
  const DEFAULT_PATH = path.join(os.homedir(), 'Documents', 'pandoc-editor')
  // ensure the default path exists
  if (!fs.existsSync(DEFAULT_PATH)) {
    fs.mkdirSync(DEFAULT_PATH, { recursive: true })
  }
  return DEFAULT_PATH
}

export const getFilePath = async (filePath: string, createDir = false): Promise<string> => {
  // Normalize the path to handle different path separators
  let normalizedPath = path.normalize(filePath)

  // Check if path is absolute using Node.js built-in method
  let isAbsolute = path.isAbsolute(normalizedPath)
  if (os.platform() !== 'win32') {
    isAbsolute &&= normalizedPath.startsWith('/home')
  } else {
    isAbsolute &&= path.dirname(normalizedPath) !== "\\"
  }

  // If the path is not absolute, treat it as relative to the default directory
  if (!isAbsolute) {
    normalizedPath = path.join(getDefaultPath(), normalizedPath)
  }

  // Create directory if requested
  if (createDir) {
    const dirname = path.dirname(normalizedPath)
    await fs.promises.mkdir(dirname, { recursive: true })
    console.log('Saving file to:', dirname, normalizedPath)
  }

  return normalizedPath
}

// Function to recursively find all .md files
export async function findMarkdownFiles(dirPath = getDefaultPath()): Promise<string[]> {
  const markdownFiles: string[] = []

  try {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true })

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name)

      if (item.isDirectory()) {
        // Skip common directories that typically don't contain user markdown files
        if (
          !['node_modules', '.git', 'dist', 'build', '.resources', 'coverage'].includes(item.name)
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
export interface FileTreeItem {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileTreeItem[]
}

// Function to recursively build file tree structure
export async function buildFileTree(dirPath: string, basePath: string): Promise<FileTreeItem[]> {
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
