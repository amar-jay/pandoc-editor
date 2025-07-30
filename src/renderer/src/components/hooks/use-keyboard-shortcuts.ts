import { EditorHandlers } from '@/types'
import { useEffect } from 'react'

export function useKeyboardShortcuts(
  handlers: Pick<
    EditorHandlers,
    | 'saveFile'
    | 'openFile'
    | 'createNewFile'
    | 'insertMarkdown'
    | 'undo'
    | 'redo'
    | 'toggleFullscreen'
  >,
  toggleSearch: () => void
) {
  const { saveFile, openFile, createNewFile, insertMarkdown, undo, redo, toggleFullscreen } =
    handlers

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            saveFile()
            break
          case 'o':
            e.preventDefault()
            openFile()
            break
          case 'n':
            e.preventDefault()
            createNewFile()
            break
          case 'f':
            e.preventDefault()
            toggleSearch()
            break
          case 'z':
            if (e.shiftKey) {
              e.preventDefault()
              redo()
            } else {
              e.preventDefault()
              undo()
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
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    saveFile,
    openFile,
    createNewFile,
    toggleSearch,
    insertMarkdown,
    redo,
    undo,
    toggleFullscreen
  ])
}
