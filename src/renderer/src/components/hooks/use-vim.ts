import { useState, useCallback } from 'react'

type VimMode = 'normal' | 'insert' | 'visual' | 'command'

interface VimState {
  mode: VimMode
  command: string
  lastCommand: string
  register: string
  count: string
}

interface UseVimProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  setContentWithoutFrontmatter: (value: string) => void
  setMarkdown: (value: string) => void
  frontmatter: Record<string, unknown> | null
  reconstructMarkdownWithFrontmatter: (content: string) => Promise<void>
}

interface UseVimReturn {
  vimState: VimState
  setVimState: React.Dispatch<React.SetStateAction<VimState>>
  executeVimCommand: (command: string) => void
  handleVimKeyDown: (e: KeyboardEvent, updateCursorPosition: () => void) => void
  moveToPosition: (textarea: HTMLTextAreaElement, position: number) => void
  moveVertical: (textarea: HTMLTextAreaElement, direction: 'up' | 'down') => void
}

export function useVim({
  textareaRef,
  setContentWithoutFrontmatter,
  setMarkdown,
  frontmatter,
  reconstructMarkdownWithFrontmatter
}: UseVimProps): UseVimReturn {
  const [vimState, setVimState] = useState<VimState>({
    mode: 'normal',
    command: '',
    lastCommand: '',
    register: '',
    count: ''
  })

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
    [
      textareaRef,
      setMarkdown,
      vimState.register,
      frontmatter,
      reconstructMarkdownWithFrontmatter,
      setContentWithoutFrontmatter
    ]
  )

  const handleVimKeyDown = useCallback(
    (e: KeyboardEvent, updateCursorPosition: () => void) => {
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
    [vimState, executeVimCommand, textareaRef, moveVertical, moveToPosition]
  )

  return {
    vimState,
    setVimState,
    executeVimCommand,
    handleVimKeyDown,
    moveToPosition,
    moveVertical
  }
}
