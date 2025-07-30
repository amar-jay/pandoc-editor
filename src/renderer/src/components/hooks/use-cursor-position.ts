import { useState, useCallback, useRef } from 'react'

interface UseCursorPositionProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  isVimEnabled?: boolean
}

interface UseCursorPositionReturn {
  cursorPosition: { line: number; col: number }
  updateCursorPosition: () => void
}

export function useCursorPosition({
  textareaRef,
  isVimEnabled = false
}: UseCursorPositionProps): UseCursorPositionReturn {
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 })
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPositionRef = useRef({ line: 1, col: 1 })

  const updateCursorPosition = useCallback(() => {
    // Only update cursor position if Vim is enabled
    if (!isVimEnabled || !textareaRef.current) return

    // Debounce the update to avoid excessive calculations
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const selectionStart = textarea.selectionStart
      const text = textarea.value

      // Early return if position hasn't changed significantly
      if (
        Math.abs(
          selectionStart - (lastPositionRef.current.line * 50 + lastPositionRef.current.col)
        ) < 5
      ) {
        return
      }

      // Optimize by only calculating when necessary
      const textBeforeCursor = text.substring(0, selectionStart)
      const lines = textBeforeCursor.split('\n')
      const lineNumber = lines.length
      const columnNumber = lines[lines.length - 1].length + 1

      const newPosition = { line: lineNumber, col: columnNumber }

      // Only update if position actually changed
      if (
        newPosition.line !== lastPositionRef.current.line ||
        newPosition.col !== lastPositionRef.current.col
      ) {
        setCursorPosition(newPosition)
        lastPositionRef.current = newPosition
      }
    }, 100) // 100ms debounce
  }, [textareaRef, isVimEnabled])

  return {
    cursorPosition,
    updateCursorPosition
  }
}
