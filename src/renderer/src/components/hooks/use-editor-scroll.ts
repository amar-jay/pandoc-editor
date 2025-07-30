import { useCallback } from 'react'

interface UseEditorScrollProps {
  lineNumbersRef: React.RefObject<HTMLDivElement | null>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

interface UseEditorScrollReturn {
  handleScroll: () => void
}

export function useEditorScroll({
  lineNumbersRef,
  textareaRef
}: UseEditorScrollProps): UseEditorScrollReturn {
  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [lineNumbersRef, textareaRef])

  return {
    handleScroll
  }
}
