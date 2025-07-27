import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Edit3, BarChart3, X, Settings, Eye, EyeOff, Save, Pencil } from 'lucide-react'
import { EditorSettings } from '@/types'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

interface EditorPaneProps {
  states: {
    documentStats: {
      words: number
      characters: number
    }
  }
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  markdown: string
  setMarkdown: (value: string) => void
  zoom: number
  settings: EditorSettings
}

type VimMode = 'normal' | 'insert' | 'visual' | 'command'

interface VimState {
  mode: VimMode
  command: string
  lastCommand: string
  register: string
  count: string
}

export function EditorPane({
  states,
  textareaRef,
  markdown,
  setMarkdown,
  zoom,
  settings
}: EditorPaneProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 })
  // markdown may contains frontmatter, so we need a proper way to handle it that aligns with our style

  // Frontmatter state
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown> | null>(null)
  const [showFrontmatter, setShowFrontmatter] = useState(false)
  const [editingFrontmatter, setEditingFrontmatter] = useState<Record<string, string>>({})
  const [isEditingFrontmatter, setIsEditingFrontmatter] = useState(false)

  // Vim state
  const [vimState, setVimState] = useState<VimState>({
    mode: 'normal',
    command: '',
    lastCommand: '',
    register: '',
    count: ''
  })

  // Store the content without frontmatter for the textarea
  const [contentWithoutFrontmatter, setContentWithoutFrontmatter] = useState('')

  // Parse frontmatter when markdown changes
  useEffect(() => {
    const parseFrontmatter = async () => {
      if (markdown && markdown.trim().startsWith('---')) {
        try {
          const result = await window.api.grayMatter(markdown)
          if (result.success && result.data) {
            setFrontmatter(result.data as Record<string, unknown>)
            setContentWithoutFrontmatter(result.content || '')
            // Auto-show frontmatter if it exists
            if (Object.keys(result.data as Record<string, unknown>).length > 0) {
              setShowFrontmatter(true)
            }
          } else {
            setFrontmatter(null)
            setContentWithoutFrontmatter(markdown)
            console.error('Failed to parse frontmatter:', result.error)
          }
        } catch (error) {
          console.error('Error parsing frontmatter:', error)
          setFrontmatter(null)
          setContentWithoutFrontmatter(markdown)
        }
      } else {
        setFrontmatter(null)
        setContentWithoutFrontmatter(markdown)
        setShowFrontmatter(false)
      }
    }

    parseFrontmatter()
  }, [markdown])

  // Helper functions for frontmatter editing
  const convertToEditingFormat = (data: Record<string, unknown>): Record<string, string> => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      ])
    )
  }

  const createFrontmatter = () => {
    const defaultFrontmatter = {
      title: 'Untitled',
      date: new Date().toISOString().split('T')[0],
      author: ''
    }
    setEditingFrontmatter(convertToEditingFormat(defaultFrontmatter))
    setIsEditingFrontmatter(true)
    setShowFrontmatter(true)
  }

  const startEditingFrontmatter = () => {
    if (frontmatter) {
      setEditingFrontmatter(convertToEditingFormat(frontmatter))
      setIsEditingFrontmatter(true)
    }
  }

  const saveFrontmatter = async () => {
    try {
      const processedFrontmatter: Record<string, unknown> = {}

      Object.entries(editingFrontmatter).forEach(([key, value]) => {
        const trimmedValue = value.trim()
        if (trimmedValue === '') return

        // Simple type conversion
        if (trimmedValue === 'true' || trimmedValue === 'false') {
          processedFrontmatter[key] = trimmedValue === 'true'
        } else if (!isNaN(Number(trimmedValue)) && trimmedValue !== '') {
          processedFrontmatter[key] = Number(trimmedValue)
        } else {
          processedFrontmatter[key] = trimmedValue
        }
      })

      // Use reverseGrayMatter API to construct the full markdown
      const result = await window.api.reverseGrayMatter(
        contentWithoutFrontmatter,
        processedFrontmatter
      )
      if (result.success && result.content) {
        setMarkdown(result.content)
        setFrontmatter(processedFrontmatter)
      } else {
        console.error('Failed to save frontmatter:', result.error)
        // Fallback to manual construction
        const yamlString = Object.entries(processedFrontmatter)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
        const newMarkdown = `---\n${yamlString}\n---\n\n${contentWithoutFrontmatter}`
        setMarkdown(newMarkdown)
        setFrontmatter(processedFrontmatter)
      }
      setIsEditingFrontmatter(false)
    } catch (error) {
      console.error('Error saving frontmatter:', error)
      window.api.showAlert(
        'Failed to save frontmatter. Please check your values: ' + JSON.stringify(error),
        'error'
      )
    }
  }

  const cancelEditingFrontmatter = () => {
    setIsEditingFrontmatter(false)
    setEditingFrontmatter({})
  }

  const updateFrontmatterValue = (key: string, value: string) => {
    setEditingFrontmatter((prev) => ({ ...prev, [key]: value }))
  }

  // Calculate line numbers
  const lines = contentWithoutFrontmatter.split('\n')
  const lineCount = lines.length

  // Update cursor position
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const text = textarea.value
    const selectionStart = textarea.selectionStart

    const textBeforeCursor = text.substring(0, selectionStart)
    const lineNumber = textBeforeCursor.split('\n').length
    const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n')
    const columnNumber = selectionStart - lastNewlineIndex

    setCursorPosition({ line: lineNumber, col: columnNumber })
  }, [textareaRef])

  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [textareaRef])

  // Vim navigation helpers
  const moveToPosition = useCallback((textarea: HTMLTextAreaElement, position: number) => {
    textarea.selectionStart = textarea.selectionEnd = position
  }, [])

  const moveVertical = useCallback(
    (textarea: HTMLTextAreaElement, direction: 'up' | 'down') => {
      const text = textarea.value
      const currentPos = textarea.selectionStart
      const currentLineStart = text.lastIndexOf('\n', currentPos - 1) + 1
      const colOffset = currentPos - currentLineStart

      if (direction === 'down') {
        const nextLineStart = text.indexOf('\n', currentPos)
        if (nextLineStart !== -1) {
          const nextLineStartPos = nextLineStart + 1
          const nextLineEnd = text.indexOf('\n', nextLineStartPos)
          const nextLineLength = (nextLineEnd === -1 ? text.length : nextLineEnd) - nextLineStartPos
          const newPos = nextLineStartPos + Math.min(colOffset, nextLineLength)
          moveToPosition(textarea, newPos)
        }
      } else {
        if (currentLineStart > 0) {
          const prevLineEnd = currentLineStart - 1
          const prevLineStart = text.lastIndexOf('\n', prevLineEnd - 1) + 1
          const prevLineLength = prevLineEnd - prevLineStart
          const newPos = prevLineStart + Math.min(colOffset, prevLineLength)
          moveToPosition(textarea, newPos)
        } else {
          moveToPosition(textarea, 0)
        }
      }
    },
    [moveToPosition]
  )

  // Helper function to reconstruct markdown with frontmatter
  const reconstructMarkdownWithFrontmatter = useCallback(
    async (content: string) => {
      if (!frontmatter || Object.keys(frontmatter).length === 0) {
        setMarkdown(content)
        return
      }

      try {
        const result = await window.api.reverseGrayMatter(content, frontmatter)

        if (result.success && result.content) {
          setMarkdown(result.content)
        } else {
          console.error('Failed to reconstruct markdown:', result.error)
          // Fallback to manual construction
          const yamlString = Object.entries(frontmatter)
            .map(([key, value]) => {
              if (typeof value === 'string' && (value.includes(':') || value.includes('\n'))) {
                return `${key}: "${value}"`
              }
              return `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
            })
            .join('\n')
          setMarkdown(`---\n${yamlString}\n---\n\n${content}`)
        }
      } catch (error) {
        console.error('Error reconstructing markdown:', error)
        // Fallback to manual construction
        const yamlString = Object.entries(frontmatter)
          .map(([key, value]) => {
            if (typeof value === 'string' && (value.includes(':') || value.includes('\n'))) {
              return `${key}: "${value}"`
            }
            return `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
          })
          .join('\n')
        setMarkdown(`---\n${yamlString}\n---\n\n${content}`)
      }
    },
    [frontmatter, setMarkdown]
  )
  const executeVimCommand = useCallback(
    (command: string) => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const text = textarea.value
      const selectionStart = textarea.selectionStart

      const updateContent = (newText: string) => {
        setContentWithoutFrontmatter(newText)
        // Update markdown with frontmatter if it exists
        if (frontmatter && Object.keys(frontmatter).length > 0) {
          reconstructMarkdownWithFrontmatter(newText)
        } else {
          setMarkdown(newText)
        }
      }

      switch (command) {
        case 'i':
          setVimState((prev) => ({ ...prev, mode: 'insert' }))
          break
        case 'a':
          setVimState((prev) => ({ ...prev, mode: 'insert' }))
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
          break
        case 'o': {
          setVimState((prev) => ({ ...prev, mode: 'insert' }))
          const lineEnd = text.indexOf('\n', selectionStart)
          const insertPos = lineEnd === -1 ? text.length : lineEnd
          updateContent(text.slice(0, insertPos) + '\n' + text.slice(insertPos))
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = insertPos + 1
          }, 0)
          break
        }
        case 'O': {
          setVimState((prev) => ({ ...prev, mode: 'insert' }))
          const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1
          updateContent(text.slice(0, lineStart) + '\n' + text.slice(lineStart))
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart
          }, 0)
          break
        }
        case 'x':
          if (selectionStart < text.length) {
            updateContent(text.slice(0, selectionStart) + text.slice(selectionStart + 1))
          }
          break
        case 'dd': {
          const currentLineStart = text.lastIndexOf('\n', selectionStart - 1) + 1
          const currentLineEnd = text.indexOf('\n', selectionStart)
          const endPos = currentLineEnd === -1 ? text.length : currentLineEnd + 1
          updateContent(text.slice(0, currentLineStart) + text.slice(endPos))
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = currentLineStart
          }, 0)
          break
        }
        case 'u':
          // Simple undo placeholder - in a real implementation you'd need an undo stack
          break
        case 'yy': {
          const lineStartYank = text.lastIndexOf('\n', selectionStart - 1) + 1
          const lineEndYank = text.indexOf('\n', selectionStart)
          const yankEnd = lineEndYank === -1 ? text.length : lineEndYank
          const yankedLine = text.slice(lineStartYank, yankEnd)
          setVimState((prev) => ({ ...prev, register: yankedLine }))
          break
        }
        case 'p':
          if (vimState.register) {
            const pastePos = text.indexOf('\n', selectionStart)
            const insertPastePos = pastePos === -1 ? text.length : pastePos + 1
            updateContent(
              text.slice(0, insertPastePos) + vimState.register + '\n' + text.slice(insertPastePos)
            )
          }
          break
      }
    },
    [textareaRef, setMarkdown, vimState.register, frontmatter, reconstructMarkdownWithFrontmatter]
  )

  // Vim key handler
  const handleVimKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!settings.vim) return

      if (vimState.mode === 'insert') {
        if (e.key === 'Escape') {
          e.preventDefault()
          setVimState((prev) => ({ ...prev, mode: 'normal' }))
          return
        }
        return // Let normal typing work in insert mode
      }

      if (vimState.mode === 'normal') {
        e.preventDefault()

        // Handle numbers for count
        if (/^\d$/.test(e.key)) {
          setVimState((prev) => ({ ...prev, count: prev.count + e.key }))
          return
        }

        // Handle movement keys
        if (!textareaRef.current) return
        const textarea = textareaRef.current
        const text = textarea.value
        const currentPos = textarea.selectionStart

        switch (e.key) {
          case 'h':
            moveToPosition(textarea, Math.max(0, currentPos - 1))
            break
          case 'l':
            moveToPosition(textarea, Math.min(text.length, currentPos + 1))
            break
          case 'j':
            moveVertical(textarea, 'down')
            break
          case 'k':
            moveVertical(textarea, 'up')
            break
          case '0':
            if (vimState.count === '') {
              const lineStart = text.lastIndexOf('\n', currentPos - 1) + 1
              textarea.selectionStart = textarea.selectionEnd = lineStart
            } else {
              setVimState((prev) => ({ ...prev, count: prev.count + '0' }))
            }
            break
          case '$': {
            const lineEnd = text.indexOf('\n', currentPos)
            textarea.selectionStart = textarea.selectionEnd = lineEnd === -1 ? text.length : lineEnd
            break
          }
          case 'G':
            textarea.selectionStart = textarea.selectionEnd = text.length
            break
          case 'g':
            if (vimState.lastCommand === 'g') {
              textarea.selectionStart = textarea.selectionEnd = 0
              setVimState((prev) => ({ ...prev, lastCommand: '' }))
            } else {
              setVimState((prev) => ({ ...prev, lastCommand: 'g' }))
            }
            break
          case 'd':
            if (vimState.lastCommand === 'd') {
              executeVimCommand('dd')
              setVimState((prev) => ({ ...prev, lastCommand: '', count: '' }))
            } else {
              setVimState((prev) => ({ ...prev, lastCommand: 'd' }))
            }
            break
          case 'y':
            if (vimState.lastCommand === 'y') {
              executeVimCommand('yy')
              setVimState((prev) => ({ ...prev, lastCommand: '', count: '' }))
            } else {
              setVimState((prev) => ({ ...prev, lastCommand: 'y' }))
            }
            break
          default:
            executeVimCommand(e.key)
            setVimState((prev) => ({ ...prev, lastCommand: '', count: '' }))
            break
        }

        updateCursorPosition()
      }
    },
    [
      settings.vim,
      vimState,
      executeVimCommand,
      updateCursorPosition,
      textareaRef,
      moveVertical,
      moveToPosition
    ]
  )

  // Set up event listeners
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.addEventListener('scroll', handleScroll)
    textarea.addEventListener('keyup', updateCursorPosition)
    textarea.addEventListener('click', updateCursorPosition)

    if (settings.vim) {
      textarea.addEventListener('keydown', handleVimKeyDown)
    }

    return () => {
      textarea.removeEventListener('scroll', handleScroll)
      textarea.removeEventListener('keyup', updateCursorPosition)
      textarea.removeEventListener('click', updateCursorPosition)
      if (settings.vim) {
        textarea.removeEventListener('keydown', handleVimKeyDown)
      }
    }
  }, [handleScroll, updateCursorPosition, handleVimKeyDown, settings.vim, textareaRef])

  // Handle regular text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContentWithoutFrontmatter(newContent)

    // Reconstruct markdown with frontmatter if it exists
    if (frontmatter && Object.keys(frontmatter).length > 0) {
      reconstructMarkdownWithFrontmatter(newContent)
    } else {
      setMarkdown(newContent)
    }
  }

  const fontSize = (settings.fontSize * zoom) / 100
  const lineHeight = settings.lineHeight

  // Render frontmatter preview
  const renderFrontmatterPreview = () => {
    if (!showFrontmatter && !isEditingFrontmatter) return null
    if (!frontmatter && !isEditingFrontmatter) return null

    return (
      <Collapsible open={showFrontmatter} onOpenChange={setShowFrontmatter}>
        <CollapsibleContent className="bg-muted/20">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Settings className="w-3 h-3" />
                Frontmatter
              </div>
              <div className="flex items-center gap-1">
                {isEditingFrontmatter ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={saveFrontmatter}
                      className="h-6 w-6 p-0"
                      title="Save frontmatter"
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEditingFrontmatter}
                      className="h-6 w-6 p-0"
                      title="Cancel editing"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={startEditingFrontmatter}
                    className="h-6 w-6 p-0"
                    title="Edit frontmatter"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {isEditingFrontmatter ? (
              <div className="space-y-2">
                {Object.entries(editingFrontmatter).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary min-w-fit">{key}:</span>
                    <input
                      value={value}
                      onChange={(e) => updateFrontmatterValue(key, e.target.value)}
                      className="font-mono h-6 flex-1 text-xs border-0 bg-accent/50 pl-2 rounded-sm focus-visible:ring-1"
                      placeholder="Enter value"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {frontmatter &&
                  Object.entries(frontmatter as Record<string, unknown>).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2">
                      <span className="font-mono  text-xs text-primary min-w-fit">{key}:</span>
                      <span className="text-muted-foreground   text-xs flex-1 break-words">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Card className="flex flex-col pt-0 overflow-auto max-h-full">
      <div className="flex flex-col">
        {/* Main Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            <span className="font-medium">Editor</span>
            {settings.vim && (
              <span
                className={`px-2 py-1 text-xs rounded font-mono ${
                  vimState.mode === 'normal'
                    ? 'bg-blue-100 text-blue-800'
                    : vimState.mode === 'insert'
                      ? 'bg-green-100 text-green-800'
                      : vimState.mode === 'visual'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                }`}
              >
                {vimState.mode.toUpperCase()}
              </span>
            )}
            {/* Frontmatter toggle button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (!frontmatter && !isEditingFrontmatter) {
                  createFrontmatter()
                } else {
                  setShowFrontmatter(!showFrontmatter)
                }
              }}
              className="h-6 w-6 p-0"
              title={
                frontmatter || isEditingFrontmatter
                  ? showFrontmatter
                    ? 'Hide frontmatter'
                    : 'Show frontmatter'
                  : 'Add frontmatter'
              }
            >
              {frontmatter || isEditingFrontmatter ? (
                showFrontmatter ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )
              ) : (
                <Settings className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {settings.vim && (
              <span className="font-mono">
                {cursorPosition.line}:{cursorPosition.col}
              </span>
            )}
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {states.documentStats.words} words, {states.documentStats.characters} chars
            </div>
          </div>
        </div>

        {/* Frontmatter Preview */}
        {renderFrontmatterPreview()}
      </div>

      <div className="flex-1 p-0 relative">
        <div ref={editorContainerRef} className="flex h-full">
          {settings.showLineNumbers && (
            <div
              ref={lineNumbersRef}
              className="flex-shrink-0 bg-muted/30 border-r overflow-hidden"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: settings.fontFamily,
                lineHeight: lineHeight,
                width: `${Math.max(3, String(lineCount).length + 1)}em`
              }}
            >
              <div className="p-4 pr-2 text-right text-muted-foreground font-mono select-none">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i + 1} style={{ height: `${fontSize * lineHeight}px` }}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={contentWithoutFrontmatter}
              onChange={handleTextChange}
              className="w-full h-full p-4 resize-none border-0 outline-none bg-transparent font-mono leading-relaxed scrollbar"
              placeholder="Start typing your markdown here..."
              spellCheck={settings.spellCheck}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: settings.fontFamily,
                lineHeight: lineHeight,
                whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre'
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
