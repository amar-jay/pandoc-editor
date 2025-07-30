import { useState, useEffect, useRef, useCallback } from 'react'

interface UseFrontmatterProps {
  markdown: string
  setMarkdown: (value: string) => void
  contentWithoutFrontmatter: string
  setContentWithoutFrontmatter: (value: string) => void
}

interface UseFrontmatterReturn {
  frontmatter: Record<string, unknown> | null
  setFrontmatter: (value: Record<string, unknown> | null) => void
  showFrontmatter: boolean
  setShowFrontmatter: (value: boolean) => void
  editingFrontmatter: [string, string][]
  setEditingFrontmatter: (value: [string, string][]) => void
  isEditingFrontmatter: boolean
  setIsEditingFrontmatter: (value: boolean) => void
  createFrontmatter: () => void
  startEditingFrontmatter: () => void
  addFrontmatterField: () => void
  saveFrontmatter: () => Promise<void>
  cancelEditingFrontmatter: () => void
  updateFrontmatterKey: (index: number, newKey: string) => void
  updateFrontmatterValue: (index: number, value: string) => void
  reconstructMarkdownWithFrontmatter: (content: string) => Promise<void>
}

export function useFrontmatter({
  markdown,
  setMarkdown,
  contentWithoutFrontmatter,
  setContentWithoutFrontmatter
}: UseFrontmatterProps): UseFrontmatterReturn {
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown> | null>(null)
  const [showFrontmatter, setShowFrontmatter] = useState(false)
  const [editingFrontmatter, setEditingFrontmatter] = useState<[string, string][]>([])
  const [isEditingFrontmatter, setIsEditingFrontmatter] = useState(false)

  const frontmatterParseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInternalUpdate = useRef(false)
  const lastMarkdownRef = useRef('')

  // Helper functions for frontmatter editing
  const convertToEditingFormat = (data: [string, unknown][]): [string, string][] => {
    return data.map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value)
    ])
  }

  const createFrontmatter = () => {
    const defaultFrontmatter: [string, unknown][] = [
      ['title', 'Untitled'],
      ['description', ''],
      ['date', new Date().toISOString().split('T')[0]],
      ['author', '']
    ]
    setEditingFrontmatter(convertToEditingFormat(defaultFrontmatter))
    setIsEditingFrontmatter(true)
    setShowFrontmatter(true)
  }

  const startEditingFrontmatter = () => {
    if (frontmatter) {
      const frontmatterArray = Object.entries(frontmatter) as [string, unknown][]
      setEditingFrontmatter(convertToEditingFormat(frontmatterArray))
      setIsEditingFrontmatter(true)
    }
  }

  const addFrontmatterField = () => {
    setEditingFrontmatter((prev) => [...prev, ['', '']])
  }

  const saveFrontmatter = async () => {
    try {
      const processedFrontmatter: Record<string, unknown> = {}

      editingFrontmatter.forEach(([key, value]) => {
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
    setEditingFrontmatter([])
  }

  const updateFrontmatterKey = (index: number, newKey: string) => {
    setEditingFrontmatter((prev) => {
      const newEditingFrontmatter = [...prev]
      newEditingFrontmatter[index] = [newKey, newEditingFrontmatter[index][1]]
      return newEditingFrontmatter
    })
  }

  const updateFrontmatterValue = (index: number, value: string) => {
    setEditingFrontmatter((prev) => {
      const newEditingFrontmatter = [...prev]
      newEditingFrontmatter[index] = [newEditingFrontmatter[index][0], value]
      return newEditingFrontmatter
    })
  }

  // Helper function to reconstruct markdown with frontmatter
  const reconstructMarkdownWithFrontmatter = useCallback(
    async (content: string) => {
      if (!frontmatter || Object.keys(frontmatter).length === 0) {
        isInternalUpdate.current = true
        setMarkdown(content)
        return
      }

      try {
        const result = await window.api.reverseGrayMatter(content, frontmatter)

        if (result.success && result.content) {
          isInternalUpdate.current = true
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
          isInternalUpdate.current = true
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
        isInternalUpdate.current = true
        setMarkdown(`---\n${yamlString}\n---\n\n${content}`)
      }
    },
    [frontmatter, setMarkdown]
  )

  // Parse frontmatter when markdown changes - but debounced and prevent cursor jumps
  useEffect(() => {
    // Skip if this is an internal update to prevent infinite loops
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    // Clear existing timeout
    if (frontmatterParseTimeoutRef.current) {
      clearTimeout(frontmatterParseTimeoutRef.current)
    }

    // Debounce frontmatter parsing to reduce IPC calls
    frontmatterParseTimeoutRef.current = setTimeout(async () => {
      // Skip if content hasn't changed significantly
      if (lastMarkdownRef.current === markdown) {
        return
      }

      lastMarkdownRef.current = markdown

      const parseFrontmatter = async () => {
        if (markdown && markdown.trim().startsWith('---')) {
          try {
            const result = await window.api.grayMatter(markdown)
            if (result.success && result.data) {
              setFrontmatter(result.data as Record<string, unknown>)

              // Only update contentWithoutFrontmatter if it's actually different
              // This prevents cursor jumps
              const newContent = result.content || ''
              if (newContent !== contentWithoutFrontmatter) {
                setContentWithoutFrontmatter(newContent)
              }

              // Auto-show frontmatter if it exists
              if (Object.keys(result.data as Record<string, unknown>).length > 0) {
                setShowFrontmatter(true)
              }
            } else {
              setFrontmatter(null)
              if (markdown !== contentWithoutFrontmatter) {
                setContentWithoutFrontmatter(markdown)
              }
              console.error('Failed to parse frontmatter:', result.error)
            }
          } catch (error) {
            console.error('Error parsing frontmatter:', error)
            setFrontmatter(null)
            if (markdown !== contentWithoutFrontmatter) {
              setContentWithoutFrontmatter(markdown)
            }
          }
        } else {
          setFrontmatter(null)
          if (markdown !== contentWithoutFrontmatter) {
            setContentWithoutFrontmatter(markdown)
          }
          setShowFrontmatter(false)
        }
      }

      await parseFrontmatter()
    }, 500) // Increased debounce to 500ms for better performance

    return () => {
      if (frontmatterParseTimeoutRef.current) {
        clearTimeout(frontmatterParseTimeoutRef.current)
      }
    }
  }, [markdown, contentWithoutFrontmatter, setContentWithoutFrontmatter])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (frontmatterParseTimeoutRef.current) {
        clearTimeout(frontmatterParseTimeoutRef.current)
      }
    }
  }, [])

  return {
    frontmatter,
    setFrontmatter,
    showFrontmatter,
    setShowFrontmatter,
    editingFrontmatter,
    setEditingFrontmatter,
    isEditingFrontmatter,
    setIsEditingFrontmatter,
    createFrontmatter,
    startEditingFrontmatter,
    addFrontmatterField,
    saveFrontmatter,
    cancelEditingFrontmatter,
    updateFrontmatterKey,
    updateFrontmatterValue,
    reconstructMarkdownWithFrontmatter
  }
}
