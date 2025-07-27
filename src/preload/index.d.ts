import { ElectronAPI } from '@electron-toolkit/preload'
import { TreeNode } from '@renderer/lib/types'

interface MarkdownFilesResult {
  success: boolean
  files?: string[]
  error?: string
}

interface ReadFileResult {
  success: boolean
  content?: string
  fileName?: string
  error?: string
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      findMarkdownFiles: (dirPath?: string) => Promise<MarkdownFilesResult>
      readFileByPath: (filePath: string) => Promise<ReadFileResult>
      saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
      getFileTree: (
        dirPath?: string
      ) => Promise<{ success: boolean; tree?: TreeNode[]; error?: string }>
      updateMarkdownFile: (
        filePath: string,
        content: string
      ) => Promise<{ success: boolean; error?: string }>
      fetchMarkdownFile: (
        filePath: string
      ) => Promise<{ success: boolean; content?: string; error?: string }>
    }
  }
}
