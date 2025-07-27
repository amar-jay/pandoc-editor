/* eslint-disable no-case-declarations */
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Edit3, BarChart3 } from 'lucide-react'
import { EditorSettings } from '@renderer/lib/types'

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

  // Vim state
  const [vimState, setVimState] = useState<VimState>({
    mode: 'normal',
    command: '',
    lastCommand: '',
    register: '',
    count: ''
  })

  // Calculate line numbers
  const lines = markdown.split('\n')
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

  // Vim command execution
  const executeVimCommand = useCallback(
    (command: string) => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const text = textarea.value
      const selectionStart = textarea.selectionStart

      switch (command) {
        case 'i':
          setVimState((prev) => ({ ...prev, mode: 'insert' }))
          break
        case 'a':
          setVimState((prev) => ({ ...prev, mode: 'insert' }))
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
          break
        case 'o':
          setVimState((prev) => ({ ...prev, mode: 'insert' }))
          const lineEnd = text.indexOf('\n', selectionStart)
          const insertPos = lineEnd === -1 ? text.length : lineEnd
          setMarkdown(text.slice(0, insertPos) + '\n' + text.slice(insertPos))
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = insertPos + 1
          }, 0)
          break
        case 'O':
          setVimState((prev) => ({ ...prev, mode: 'insert' }))
          const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1
          setMarkdown(text.slice(0, lineStart) + '\n' + text.slice(lineStart))
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart
          }, 0)
          break
        case 'x':
          if (selectionStart < text.length) {
            setMarkdown(text.slice(0, selectionStart) + text.slice(selectionStart + 1))
          }
          break
        case 'dd': {
          const currentLineStart = text.lastIndexOf('\n', selectionStart - 1) + 1
          const currentLineEnd = text.indexOf('\n', selectionStart)
          const endPos = currentLineEnd === -1 ? text.length : currentLineEnd + 1
          setMarkdown(text.slice(0, currentLineStart) + text.slice(endPos))
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
            setMarkdown(
              text.slice(0, insertPastePos) + vimState.register + '\n' + text.slice(insertPastePos)
            )
          }
          break
      }
    },
    [textareaRef, setMarkdown, vimState.register]
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
            textarea.selectionStart = textarea.selectionEnd = Math.max(0, currentPos - 1)
            break
          case 'l':
            textarea.selectionStart = textarea.selectionEnd = Math.min(text.length, currentPos + 1)
            break
          case 'j': {
            const currentLineJ = text.lastIndexOf('\n', currentPos - 1)
            const nextLineJ = text.indexOf('\n', currentPos)
            const nextLineStartJ = nextLineJ === -1 ? text.length : nextLineJ + 1
            const nextLineEndJ = text.indexOf('\n', nextLineStartJ)
            const colOffsetJ = currentPos - currentLineJ - 1
            const nextLineLengthJ =
              (nextLineEndJ === -1 ? text.length : nextLineEndJ) - nextLineStartJ
            const newPosJ = nextLineStartJ + Math.min(colOffsetJ, nextLineLengthJ)
            if (nextLineStartJ < text.length) {
              textarea.selectionStart = textarea.selectionEnd = newPosJ
            }
            break
          }
          case 'k':
            const currentLineK = text.lastIndexOf('\n', currentPos - 1)
            if (currentLineK > 0) {
              const prevLineStartK = text.lastIndexOf('\n', currentLineK - 1) + 1
              const colOffsetK = currentPos - currentLineK - 1
              const prevLineLengthK = currentLineK - prevLineStartK
              const newPosK = prevLineStartK + Math.min(colOffsetK, prevLineLengthK)
              textarea.selectionStart = textarea.selectionEnd = newPosK
            } else if (currentLineK === 0) {
              textarea.selectionStart = textarea.selectionEnd = 0
            }
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
    [settings.vim, vimState, executeVimCommand, updateCursorPosition, textareaRef]
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
    setMarkdown(e.target.value)
  }

  const fontSize = (settings.fontSize * zoom) / 100
  const lineHeight = settings.lineHeight

  return (
    <Card className="flex flex-col pt-0 overflow-auto max-h-full">
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
              value={markdown}
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
