export interface EditorStates {
  replaceTerm: string
  searchTerm: string
  undoStack: string[]
  redoStack: string[]
  // markdown: string
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

// Types for better type safety
export interface EditorHookReturn {
  markdown: string
  settings: EditorSettings
  documentStats: DocumentStats
  states: EditorStates
  handlers: EditorHandlers
  search: SearchHandlers
  refs: EditorRefs
}

export interface EditorHandlers {
  setMarkdown: (content: string) => void
  loadFile: (filePath: string) => Promise<void>
  saveFile: () => Promise<void>
  saveFileAs: (filePath?: string) => Promise<void>
  createNewFile: () => void
  openFile: () => void
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  exportFile: (format: 'html' | 'txt' | 'md') => void
  insertMarkdown: (before: string, after?: string) => void
  undo: () => void
  redo: () => void
  copyToClipboard: () => Promise<void>
  toggleFullscreen: () => void
  updateSettings: (settings: Partial<EditorSettings>) => void
}

export interface SearchHandlers {
  setSearchTerm: (term: string) => void
  setReplaceTerm: (term: string) => void
  toggleSearch: () => void
  search: () => void
  replace: () => void
  replaceAll: () => void
  showSearch: boolean
}

export interface EditorRefs {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  fileInputRef: React.RefObject<HTMLInputElement | null>
}