import { EditorStates, EditorSettings, DocumentStats } from '@renderer/lib/types'
import { calculateStats } from '@renderer/lib/utils'
import { useState, useRef, useCallback, useEffect } from 'react'
import { defaultMarkdown } from '../default-markdown'
//import vi from 'zod/v4/locales/vi.cjs'

export function useEditorHook(fileName: string) {
  const [markdown, setMarkdown] = useState(defaultMarkdown)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState<EditorSettings>({
    theme: 'auto',
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    lineHeight: 1.5,
    showLineNumbers: false,
    wordWrap: true,
    autoSave: true,
    spellCheck: false,
    vim: false
  })
  const [documentStats, setDocumentStats] = useState<DocumentStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  })
  const [recentFiles, setRecentFiles] = useState<string[]>([])
  const [currentFileName, setCurrentFileName] = useState(fileName)
  const [isModified, setIsModified] = useState(false)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate document statistics
  const calculateStatsHook = useCallback(calculateStats, [])

  // Update stats when markdown changes
  useEffect(() => {
    setDocumentStats(calculateStatsHook(markdown))
    setIsModified(true)
  }, [markdown, calculateStatsHook])

  // Auto-save functionality
  useEffect(() => {
    if (settings.autoSave && isModified) {
      const timer = setTimeout(() => {
        localStorage.setItem('markdown-editor-content', markdown)
        localStorage.setItem('markdown-editor-filename', currentFileName)
        setIsModified(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [markdown, settings.autoSave, isModified, currentFileName])

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem('markdown-editor-con/Atent')
    const savedFilename = localStorage.getItem('markdown-editor-filename')
    if (saved) {
      setMarkdown(saved)
    }
    if (savedFilename) {
      setCurrentFileName(savedFilename)
    }
  }, [])

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previous = undoStack[undoStack.length - 1]
      setRedoStack([...redoStack, markdown])
      setUndoStack(undoStack.slice(0, -1))
      setMarkdown(previous)
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1]
      setUndoStack([...undoStack, markdown])
      setRedoStack(redoStack.slice(0, -1))
      setMarkdown(next)
    }
  }

  const insertMarkdown = (before: string, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = markdown.substring(start, end)
    const newText =
      markdown.substring(0, start) + before + selectedText + after + markdown.substring(end)

    setUndoStack([...undoStack, markdown])
    setRedoStack([])
    setMarkdown(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const handleSave = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentFileName
    a.click()
    URL.revokeObjectURL(url)
    setIsModified(false)
  }

  const handleOpen = () => {
    fileInputRef.current?.click()
  }

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setUndoStack([...undoStack, markdown])
        setRedoStack([])
        setMarkdown(content)
        setCurrentFileName(file.name)
        setRecentFiles([file.name, ...recentFiles.filter((f) => f !== file.name)].slice(0, 5))
      }
      reader.readAsText(file)
    }
  }

  const handleNew = () => {
    if (isModified) {
      if (confirm('You have unsaved changes. Are you sure you want to create a new document?')) {
        setUndoStack([...undoStack, markdown])
        setRedoStack([])
        setMarkdown('')
        setCurrentFileName('Untitled.md')
        setIsModified(false)
      }
    } else {
      setUndoStack([...undoStack, markdown])
      setRedoStack([])
      setMarkdown('')
      setCurrentFileName('Untitled.md')
    }
  }

  const handleExport = (format: string) => {
    let content = ''
    let filename = currentFileName.replace('.md', '')
    let mimeType = ''

    switch (format) {
      case 'html':
        // This would need a proper markdown to HTML converter
        content = `<!DOCTYPE html>
<html>
<head>
    <title>${filename}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
    </style>
</head>
<body>
    <pre>${markdown}</pre>
</body>
</html>`
        filename += '.html'
        mimeType = 'text/html'
        break
      case 'txt':
        content = markdown.replace(/[#*`_~[\]()]/g, '')
        filename += '.txt'
        mimeType = 'text/plain'
        break
      default:
        content = markdown
        filename += '.md'
        mimeType = 'text/markdown'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSearch = () => {
    if (!searchTerm) return
    const textarea = textareaRef.current
    if (!textarea) return

    const text = textarea.value.toLowerCase()
    const search = searchTerm.toLowerCase()
    const index = text.indexOf(search, textarea.selectionStart + 1)

    if (index !== -1) {
      textarea.focus()
      textarea.setSelectionRange(index, index + searchTerm.length)
    }
  }

  const handleReplace = () => {
    if (!searchTerm) return
    const newMarkdown = markdown.replace(new RegExp(searchTerm, 'g'), replaceTerm)
    setUndoStack([...undoStack, markdown])
    setRedoStack([])
    setMarkdown(newMarkdown)
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return {
    handlers: {
      handleExport,
      handleOpen,
      handleSave,
      handleNew,
      handleFileLoad,
      handleUndo,
      handleRedo,
      handleSearch,
      handleReplace,
      insertMarkdown,
      setIsFullscreen,
      setMarkdown,
      toggleShowSearch: () => setShowSearch((showSearch) => !showSearch),
      setRecentFiles,
      copyToClipboard
    },
    search: {
      setSearchTerm,
      setReplaceTerm,
      showSearch
    },
    settings: {
      settings,
      setSettings
    },
    states: {
      replaceTerm,
      searchTerm,
      undoStack,
      redoStack,
      markdown,
      isFullscreen,
      isModified,
      currentFileName,
      copied,
      recentFiles,
      documentStats
    } as EditorStates,
    refs: {
      textareaRef,
      fileInputRef
    }
  }
}

export function useKeyboardShortcuts(handlers, states) {
  const {
    handleSave,
    handleOpen,
    handleNew,
    insertMarkdown,
    handleUndo,
    handleRedo,
    setShowSearch,
    setIsFullscreen
  } = handlers
  const { isFullscreen, undoStack, redoStack } = states
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleSave()
            break
          case 'o':
            e.preventDefault()
            handleOpen()
            break
          case 'n':
            e.preventDefault()
            handleNew()
            break
          case 'f':
            e.preventDefault()
            setShowSearch(true)
            break
          case 'z':
            if (e.shiftKey) {
              e.preventDefault()
              handleRedo()
            } else {
              e.preventDefault()
              handleUndo()
            }
            break
          case 'b':
            e.preventDefault()
            insertMarkdown('**', '**')
            break
          case 'i':
            e.preventDefault()
            insertMarkdown('*', '*')
            break
        }
      }
      if (e.key === 'F11') {
        e.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isFullscreen,
    undoStack,
    redoStack,
    handleSave,
    handleOpen,
    handleNew,
    setShowSearch,
    insertMarkdown,
    handleRedo,
    handleUndo,
    setIsFullscreen
  ])
}
