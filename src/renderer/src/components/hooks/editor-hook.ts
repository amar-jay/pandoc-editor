import type {
  EditorStates,
  EditorSettings,
  DocumentStats,
  EditorHookReturn,
  EditorHandlers,
  SearchHandlers,
  EditorRefs
} from '@/types'
import { calculateStats } from '@renderer/lib/utils'
import { useState, useRef, useCallback, useEffect } from 'react'
import { defaultMarkdown } from '../default-markdown'
import { loadFromStorage, saveToStorage } from '@renderer/lib/local-storage'
import { exportToFile } from './use-export-file'

// Constants
const STORAGE_KEYS = {
  CONTENT: 'pandoc-editor-content',
  FILEPATH: 'pandoc-editor-filepath',
  SETTINGS: 'pandoc-editor-settings',
  RECENT_FILES: 'pandoc-editor-recent-files'
} as const

const MAX_UNDO_STACK_SIZE = 50
const MAX_RECENT_FILES = 10
const AUTO_SAVE_DELAY = 2000

const showError = (message: string, error?: unknown): void => {
  console.error(message, error)
  window.api.showAlert(message, 'error')
}

const confirmUnsavedChanges = (): boolean => {
  return confirm('You have unsaved changes. Are you sure you want to continue?')
}

export function useEditorHook(): EditorHookReturn {
  // Core state
  const [markdown, setMarkdownState] = useState('')
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const [currentFileName, setCurrentFileName] = useState('')
  const [isModified, setIsModified] = useState(false)

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')

  // Undo/Redo state
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  // Settings and stats
  const [settings, setSettings] = useState<EditorSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, {
      theme: 'auto' as const,
      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      lineHeight: 1.5,
      showLineNumbers: false,
      wordWrap: true,
      autoSave: true,
      spellCheck: false,
      vim: false,
      settingsDialog: false
    })
  )

  const [documentStats, setDocumentStats] = useState<DocumentStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  })

  const [recentFiles, setRecentFiles] = useState<string[]>(() =>
    loadFromStorage(STORAGE_KEYS.RECENT_FILES, [])
  )

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const copiedTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const cursorTimeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set())

  // Memoized calculated stats
  const updateDocumentStats = useCallback((content: string) => {
    setDocumentStats(calculateStats(content))
  }, [])

  // Core markdown setter with proper side effects
  const setMarkdown = useCallback(
    (content: string, skipUndo = false) => {
      if (!skipUndo && content !== markdown) {
        setUndoStack((prev) => [...prev.slice(-MAX_UNDO_STACK_SIZE + 1), markdown])
        setRedoStack([])
      }

      setMarkdownState(content)
      setIsModified(true)
      updateDocumentStats(content)
    },
    [markdown, updateDocumentStats]
  )

  // Auto-save effect
  useEffect(() => {
    if (!settings.autoSave || !isModified || !currentFilePath) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await window.api.saveFile(currentFilePath, markdown)
        if (result.success) {
          setIsModified(false)
          saveToStorage(STORAGE_KEYS.CONTENT, markdown)
          saveToStorage(STORAGE_KEYS.FILEPATH, currentFilePath)
        } else {
          console.error('Auto-save failed:', result.error)
          // Don't mark as unmodified if save failed
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
        // Don't mark as unmodified if save failed
      }
    }, AUTO_SAVE_DELAY)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [markdown, settings.autoSave, isModified, currentFilePath])

  // Load initial content
  useEffect(() => {
    const initializeEditor = async () => {
      const savedFilePath = loadFromStorage(STORAGE_KEYS.FILEPATH, null)

      if (savedFilePath) {
        try {
          const result = await window.api.readFileByPath(savedFilePath)
          if (result.success && result.content) {
            setMarkdownState(result.content)
            setCurrentFilePath(savedFilePath)
            setCurrentFileName(result.fileName || 'Untitled.md')
            setIsModified(false)
            updateDocumentStats(result.content)
            return
          }
        } catch (error) {
          console.warn('Failed to load saved file:', error)
        }
      }

      // Fallback to stored content or default
      const savedContent = loadFromStorage(STORAGE_KEYS.CONTENT, defaultMarkdown)
      setMarkdownState(savedContent)
      updateDocumentStats(savedContent)
    }

    initializeEditor()
  }, [updateDocumentStats])

  // Save settings to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings)
  }, [settings])

  // Save recent files to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECENT_FILES, recentFiles)
  }, [recentFiles])

  // File operations
  const loadFile = useCallback(
    async (filePath: string) => {
      if (isModified && !confirmUnsavedChanges()) return

      try {
        const result = await window.api.readFileByPath(filePath)
        if (result.success) {
          setMarkdownState(result.content || '')
          setCurrentFilePath(filePath)
          setCurrentFileName(result.fileName || 'Untitled.md')
          setIsModified(false)
          setUndoStack([])
          setRedoStack([])
          updateDocumentStats(result.content || '')

          // Update recent files
          setRecentFiles((prev) => {
            const filtered = prev.filter((f) => f !== filePath)
            return [filePath, ...filtered].slice(0, MAX_RECENT_FILES)
          })
        } else {
          showError(
            `Failed to load file: ${result.error || 'Unknown error'}, ${JSON.stringify(result)}`
          )
        }
      } catch (error) {
        showError('Error loading file. Please try again.', error)
      }
    },
    [isModified, updateDocumentStats]
  )

  const saveFile = useCallback(async () => {
    if (!currentFilePath) {
      showError('No file path specified. Use Save As instead.')
      return
    }

    try {
      const result = await window.api.saveFile(currentFilePath, markdown)
      if (result.success) {
        setIsModified(false)
        saveToStorage(STORAGE_KEYS.CONTENT, markdown)
        saveToStorage(STORAGE_KEYS.FILEPATH, currentFilePath)
      } else {
        showError(`Failed to save file: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      showError('Error saving file. Please try again.', error)
    }
  }, [currentFilePath, markdown])

  const saveFileAs = useCallback(
    async (filePath?: string) => {
      if (!filePath) {
        // This would typically open a file dialog, but we'll use the simple approach for now
        const newPath = prompt('Enter file path:', currentFilePath || `${currentFileName}`)
        if (!newPath) return
        filePath = newPath
      }

      try {
        const result = await window.api.saveFile(filePath, markdown)
        if (result.success) {
          setCurrentFilePath(filePath)
          setCurrentFileName(filePath.split('/').pop() || 'Untitled.md')
          setIsModified(false)
          saveToStorage(STORAGE_KEYS.CONTENT, markdown)
          saveToStorage(STORAGE_KEYS.FILEPATH, filePath)
        } else {
          showError(`Failed to save file: ${result.error || 'Unknown error'}`)
        }
      } catch (error) {
        showError('Error saving file. Please try again.', error)
      }
    },
    [currentFilePath, currentFileName, markdown]
  )

  const createNewFile = useCallback(() => {
    if (isModified && !confirmUnsavedChanges()) return

    setMarkdownState('')
    setCurrentFilePath(null)
    setCurrentFileName('Untitled.md')
    setIsModified(false)
    setUndoStack([])
    setRedoStack([])
    updateDocumentStats('')
  }, [isModified, updateDocumentStats])

  const openFile = useCallback(async () => {
    if (isModified && !confirmUnsavedChanges()) return

    try {
      const result = await window.api.showOpenDialog()
      if (result.success && result.filePath) {
        await loadFile(result.filePath)
      } else if (!result.canceled && result.error) {
        showError(`Failed to open file: ${result.error}`)
      }
    } catch (error) {
      showError('Error opening file dialog. Please try again.', error)
    }
  }, [isModified, loadFile])

  // Handler for when a file is selected via the file input

  const handleFileInputChangeIPC = useCallback(
    async (path: string) => {
      const file = await window.api.readFileByPath(path)

      if (file) {
        if (file.error) {
          return showError(`Failed to read file: ${file.error || 'Unknown error'}`)
        }
        if (!file.content) {
          return showError('File is empty or could not be read.')
        }
        if (!file.fileName) {
          return showError('File name is missing.')
        }
        setMarkdownState(file.content || '')
        setCurrentFilePath(path)
        setCurrentFileName(file.fileName || 'Untitled.md')
        setIsModified(false)
        setUndoStack([])
        setRedoStack([])
        updateDocumentStats(file.content || '')
      }
    },
    [updateDocumentStats]
  )

  // Export functionality
  const exportFile = useCallback(
    (format: 'html' | 'txt' | 'md') => {
      const { content, filename, mimeType } = exportToFile(markdown, currentFileName, format)
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [currentFileName, markdown]
  )

  // Editor operations
  const insertMarkdown = useCallback((before: string, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const textareaContent = textarea.value
    const selectedText = textareaContent.substring(start, end)
    const newContent =
      textareaContent.substring(0, start) +
      before +
      selectedText +
      after +
      textareaContent.substring(end)

    // Update the textarea content directly first
    textarea.value = newContent

    // Create a synthetic event to trigger the change handler
    const event = new Event('input', { bubbles: true })
    Object.defineProperty(event, 'target', { value: textarea, enumerable: true })
    textarea.dispatchEvent(event)

    // Restore cursor position
    const timeoutId = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = start + before.length + selectedText.length + after.length
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
      cursorTimeoutRefs.current.delete(timeoutId)
    }, 0)

    cursorTimeoutRefs.current.add(timeoutId)
  }, [])

  // Undo/Redo
  const undo = useCallback(() => {
    if (undoStack.length === 0) return

    const previous = undoStack[undoStack.length - 1]
    setRedoStack((prev) => [...prev, markdown])
    setUndoStack((prev) => prev.slice(0, -1))
    setMarkdownState(previous)
    setIsModified(true)
    updateDocumentStats(previous)
  }, [undoStack, markdown, updateDocumentStats])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return

    const next = redoStack[redoStack.length - 1]
    setUndoStack((prev) => [...prev, markdown])
    setRedoStack((prev) => prev.slice(0, -1))
    setMarkdownState(next)
    setIsModified(true)
    updateDocumentStats(next)
  }, [redoStack, markdown, updateDocumentStats])

  // Search operations
  const search = useCallback(() => {
    if (!searchTerm) return

    const textarea = textareaRef.current
    if (!textarea) return

    const text = textarea.value.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    const index = text.indexOf(searchLower, textarea.selectionEnd)

    if (index !== -1) {
      textarea.focus()
      console.log('>>text area selected range in search: ', searchTerm.length, index)
      textarea.setSelectionRange(index, index + searchTerm.length)
    } else {
      // Search from beginning if not found after cursor
      const indexFromStart = text.indexOf(searchLower)
      if (indexFromStart !== -1) {
        textarea.focus()
        textarea.setSelectionRange(indexFromStart, indexFromStart + searchTerm.length)
      }
    }
  }, [searchTerm])

  const replace = useCallback(() => {
    if (!searchTerm) return

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = markdown.substring(start, end)

    if (selectedText.toLowerCase() === searchTerm.toLowerCase()) {
      const newText = markdown.substring(0, start) + replaceTerm + markdown.substring(end)

      setMarkdown(newText)

      const timeoutId = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(
            start + replaceTerm.length,
            start + replaceTerm.length
          )
        }
        cursorTimeoutRefs.current.delete(timeoutId)
      }, 0)

      cursorTimeoutRefs.current.add(timeoutId)
    }
  }, [searchTerm, replaceTerm, markdown, setMarkdown])

  const replaceAll = useCallback(() => {
    if (!searchTerm) return

    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const newMarkdown = markdown.replace(regex, replaceTerm)

    if (newMarkdown !== markdown) {
      setMarkdown(newMarkdown)
    }
  }, [searchTerm, replaceTerm, markdown, setMarkdown])

  // Utility functions
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)

      // Clear existing timeout
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current)
      }

      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      showError('Failed to copy to clipboard', error)
    }
  }, [markdown])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev)
  }, [])

  const updateSettings = useCallback((newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      // Clean up auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Clean up copied state timeout
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current)
      }

      // Clean up all cursor positioning timeouts
      cursorTimeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId))
      // eslint-disable-next-line react-hooks/exhaustive-deps
      cursorTimeoutRefs.current.clear()
    }
  }, [])

  const states: EditorStates = {
    replaceTerm,
    searchTerm,
    undoStack,
    redoStack,
    isFullscreen,
    isModified,
    currentFileName,
    currentFilePath: currentFilePath || '',
    copied,
    recentFiles,
    documentStats
  }

  const handlers: EditorHandlers = {
    setMarkdown,
    loadFile,
    saveFile,
    saveFileAs,
    createNewFile,
    openFile,
    openFileWithPath: handleFileInputChangeIPC,
    exportFile,
    insertMarkdown,
    undo,
    redo,
    copyToClipboard,
    toggleFullscreen,
    updateSettings,
    toggleSettingsDialog: () => {
      setSettings((prev) => ({ ...prev, settingsDialog: !prev.settingsDialog }))
    }
  }

  const searchHandlers: SearchHandlers = {
    setSearchTerm,
    setReplaceTerm,
    toggleSearch,
    search,
    replace,
    replaceAll,
    showSearch
  }

  const refs: EditorRefs = {
    textareaRef
  }

  return {
    markdown,
    settings,
    documentStats,
    states,
    handlers,
    search: searchHandlers,
    refs
  }
}
