import React, { useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Edit3, BarChart3, Settings, Eye, EyeOff } from 'lucide-react'
import { EditorSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { FrontmatterPreview } from '@/components/frontmatter-preview'
import { useVim, useCursorPosition, useEditorScroll, useEditorContent } from '@/components/hooks'

interface EditorPaneProps {
  isActive?: boolean
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

export function EditorPane({
  states,
  textareaRef,
  markdown,
  setMarkdown,
  zoom,
  isActive = true,
  settings
}: EditorPaneProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Use the unified editor content hook
  const editorContent = useEditorContent({
    markdown,
    setMarkdown
  })

  // Extract values for cleaner usage
  const {
    contentWithoutFrontmatter,
    setContentWithoutFrontmatter,
    handleTextChange,
    frontmatter,
    showFrontmatter,
    setShowFrontmatter,
    isEditingFrontmatter,
    editingFrontmatter,
    createFrontmatter,
    startEditingFrontmatter,
    addFrontmatterField,
    saveFrontmatter,
    cancelEditingFrontmatter,
    updateFrontmatterKey,
    updateFrontmatterValue,
    reconstructMarkdownWithFrontmatter
  } = editorContent

  // Initialize vim functionality
  const vimHook = useVim({
    textareaRef,
    setContentWithoutFrontmatter,
    setMarkdown,
    frontmatter,
    reconstructMarkdownWithFrontmatter
  })

  // Initialize cursor position tracking (only for Vim mode)
  const { cursorPosition, updateCursorPosition } = useCursorPosition({
    textareaRef,
    isVimEnabled: settings.vim
  })

  // Initialize scroll synchronization
  const { handleScroll } = useEditorScroll({ lineNumbersRef, textareaRef })

  // Calculate line numbers
  const lines = contentWithoutFrontmatter.split('\n')
  const lineCount = lines.length

  // Vim key handler with cursor update
  const handleVimKeyDownWithCursor = useCallback(
    (e: KeyboardEvent) => {
      vimHook.handleVimKeyDown(e, updateCursorPosition)
    },
    [vimHook, updateCursorPosition]
  )

  // Set up event listeners
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Always listen to scroll
    textarea.addEventListener('scroll', handleScroll)

    if (settings.vim) {
      // Only add cursor tracking listeners in Vim mode
      textarea.addEventListener('keyup', updateCursorPosition)
      textarea.addEventListener('click', updateCursorPosition)
      textarea.addEventListener('keydown', handleVimKeyDownWithCursor)
    }

    return () => {
      textarea.removeEventListener('scroll', handleScroll)
      if (settings.vim) {
        textarea.removeEventListener('keyup', updateCursorPosition)
        textarea.removeEventListener('click', updateCursorPosition)
        textarea.removeEventListener('keydown', handleVimKeyDownWithCursor)
      }
    }
  }, [handleScroll, updateCursorPosition, handleVimKeyDownWithCursor, settings.vim, textareaRef])

  const fontSize = (settings.fontSize * zoom) / 100
  const lineHeight = settings.lineHeight
  if (!isActive) {
    return <></>
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
                  vimHook.vimState.mode === 'normal'
                    ? 'bg-blue-100 text-blue-800'
                    : vimHook.vimState.mode === 'insert'
                      ? 'bg-green-100 text-green-800'
                      : vimHook.vimState.mode === 'visual'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                }`}
              >
                {vimHook.vimState.mode.toUpperCase()}
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
        <FrontmatterPreview
          frontmatter={frontmatter}
          showFrontmatter={showFrontmatter}
          setShowFrontmatter={setShowFrontmatter}
          isEditingFrontmatter={isEditingFrontmatter}
          editingFrontmatter={editingFrontmatter}
          startEditingFrontmatter={startEditingFrontmatter}
          addFrontmatterField={addFrontmatterField}
          saveFrontmatter={saveFrontmatter}
          cancelEditingFrontmatter={cancelEditingFrontmatter}
          updateFrontmatterKey={updateFrontmatterKey}
          updateFrontmatterValue={updateFrontmatterValue}
        />
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
