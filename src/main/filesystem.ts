import path from 'path'
import os from 'os'
import fs from 'fs'

// Function to recursively find all .md files
export async function findMarkdownFiles(
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
