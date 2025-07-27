import type React from 'react' // does this load react or just types?
export interface EditorStates {
  replaceTerm: string
  searchTerm: string
  undoStack: string[]
  redoStack: string[]
  // markdown: string
  isFullscreen: boolean
  isModified: boolean
  currentFileName: string
  currentFilePath: string
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
  // for managing settings dialog state
  settingsDialog: boolean
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
  openFileWithPath: (path: string) => void
  exportFile: (format: 'html' | 'txt' | 'md') => void
  insertMarkdown: (before: string, after?: string) => void
  undo: () => void
  redo: () => void
  copyToClipboard: () => Promise<void>
  toggleFullscreen: () => void
  updateSettings: (settings: Partial<EditorSettings>) => void
  toggleSettingsDialog: () => void
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

export interface AlertTypes {
  INFO: 'info'
  WARNING: 'warning'
  ERROR: 'error'
}

// Pandoc conversion types
export interface PandocOptions {
  // Output format options
  outputFormat: 'pdf' | 'html' | 'latex' | 'docx' | 'epub' | 'odt' | 'rtf' | 'txt'

  // PDF specific options
  pdfEngine?:
    | 'pdflatex'
    | 'xelatex'
    | 'lualatex'
    | 'tectonic'
    | 'wkhtmltopdf'
    | 'weasyprint'
    | 'pagedjs-cli'

  // Bibliography options
  bibliography?: string // Path to .bib file
  csl?: string // Citation Style Language file

  // Template and styling
  template?: string
  css?: string // For HTML output

  // Font options
  mainfont?: string
  sansfont?: string
  monofont?: string
  mathfont?: string

  // Document options
  toc?: boolean // Table of contents
  tocDepth?: number
  numberSections?: boolean

  // Metadata
  title?: string
  author?: string
  date?: string

  // Additional Pandoc options
  standalone?: boolean
  selfContained?: boolean // For HTML

  // Custom variables
  variables?: Record<string, string>

  // Custom Pandoc arguments
  customArgs?: string[]
}

export interface ConversionResult {
  success: boolean
  outputPath?: string
  error?: string
  command?: string
}

export interface PandocAPIResponse<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

export interface AvailableEnginesResponse {
  success: boolean
  engines?: string[]
  error?: string
}
