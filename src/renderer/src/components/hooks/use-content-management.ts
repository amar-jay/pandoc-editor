import { useState, useCallback, useRef } from 'react'

interface UseContentManagementProps {
  setMarkdown: (value: string) => void
  frontmatter: Record<string, unknown> | null
  reconstructMarkdownWithFrontmatter: (content: string) => Promise<void>
}

interface UseContentManagementReturn {
  contentWithoutFrontmatter: string
  setContentWithoutFrontmatter: (value: string) => void
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

export function useContentManagement({
  setMarkdown,
  frontmatter,
  reconstructMarkdownWithFrontmatter
}: UseContentManagementProps): UseContentManagementReturn {
  const [contentWithoutFrontmatter, setContentWithoutFrontmatter] = useState('')
  const reconstructTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInternalUpdate = useRef(false)
  const lastContentRef = useRef('')

  // Handle regular text changes with debouncing for frontmatter reconstruction
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value

      // Early return if content hasn't actually changed
      if (newContent === lastContentRef.current) {
        return
      }

      lastContentRef.current = newContent
      setContentWithoutFrontmatter(newContent)

      // Clear existing timeout
      if (reconstructTimeoutRef.current) {
        clearTimeout(reconstructTimeoutRef.current)
      }

      // If no frontmatter, update immediately
      if (!frontmatter || Object.keys(frontmatter).length === 0) {
        isInternalUpdate.current = true
        setMarkdown(newContent)
        return
      }

      // Debounce frontmatter reconstruction to reduce async calls
      reconstructTimeoutRef.current = setTimeout(() => {
        reconstructMarkdownWithFrontmatter(newContent)
      }, 200) // Increased debounce for better performance
    },
    [frontmatter, setMarkdown, reconstructMarkdownWithFrontmatter]
  )

  return {
    contentWithoutFrontmatter,
    setContentWithoutFrontmatter,
    handleTextChange
  }
}
