import { useRef, useEffect } from 'react'

export default function CustomCursorEditor() {
  const editorRef = useRef(null)
  const caretRef = useRef<HTMLDivElement>(null)

  const updateCaret = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0).cloneRange()
    if (range.collapsed) {
      const rects = range.getClientRects()
      if (rects.length > 0) {
        const rect = rects[0]
        const caret = caretRef.current
        if (!caret) return
        caret.style.left = rect.left + 'px'
        caret.style.top = rect.top + 'px'
        caret.style.height = rect.height + 'px'
        caret.style.display = 'block'
      }
    }
  }

  useEffect(() => {
    document.addEventListener('selectionchange', updateCaret)
    return () => {
      document.removeEventListener('selectionchange', updateCaret)
    }
  }, [])

  return (
    <div className="relative border p-2 w-[500px] h-[300px] overflow-auto font-mono">
      {/* Fake Caret */}
      <div
        ref={caretRef}
        className="absolute w-[2px] bg-red-600 animate-pulse pointer-events-none"
        style={{ display: 'none' }}
      />

      {/* Editable div */}
      <div
        ref={editorRef}
        contentEditable
        spellCheck={false}
        onInput={updateCaret}
        onClick={updateCaret}
        onKeyUp={updateCaret}
        className="w-full h-full outline-none"
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      />
    </div>
  )
}
