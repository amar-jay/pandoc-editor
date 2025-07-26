export interface EditorStates {
  replaceTerm: string
  searchTerm: string
  undoStack: string[]
  redoStack: string[]
  markdown: string
  isFullscreen: boolean
  isModified: boolean
  currentFileName: string
  copied: boolean
  recentFiles: string[]
  documentStats: DocumentStats
}
export interface EditorSettings {
  customCursor?: string // CSS cursor value
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  fontFamily: string
  lineHeight: number
  showLineNumbers: boolean
  wordWrap: boolean
  autoSave: boolean
  spellCheck: boolean
  vim: boolean
  cursorStyle?: 'default' | 'thick' | 'block' | 'underline'
}

export interface DocumentStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  readingTime: number
}

type FileNode = {
  name: string
  type: 'file'
  path: string
}

type FolderNode = {
  name: string
  type: 'folder'
  path: string
  children: TreeNode[]
}

export type TreeNode = FileNode | FolderNode
