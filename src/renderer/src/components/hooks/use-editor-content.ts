import { useState, useRef, useCallback, useEffect } from 'react'

interface UseEditorContentProps {
  markdown: string
  setMarkdown: (value: string) => void
}

interface UseEditorContentReturn {
  // Content state
  contentWithoutFrontmatter: string
  setContentWithoutFrontmatter: (value: string) => void
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void

  // Frontmatter state
  frontmatter: Record<string, unknown> | null
  setFrontmatter: (value: Record<string, unknown> | null) => void
  showFrontmatter: boolean
  setShowFrontmatter: (value: boolean) => void
  editingFrontmatter: [string, string][]
  setEditingFrontmatter: (value: [string, string][]) => void
  isEditingFrontmatter: boolean
  setIsEditingFrontmatter: (value: boolean) => void

  // Frontmatter actions
  createFrontmatter: () => void
  startEditingFrontmatter: () => void
  addFrontmatterField: () => void
  saveFrontmatter: () => Promise<void>
  cancelEditingFrontmatter: () => void
  updateFrontmatterKey: (index: number, newKey: string) => void
  updateFrontmatterValue: (index: number, value: string) => void
  reconstructMarkdownWithFrontmatter: (content: string) => Promise<void>
}

export function useEditorContent({
  markdown,
  setMarkdown
}: UseEditorContentProps): UseEditorContentReturn {
  // Content state
  const [contentWithoutFrontmatter, setContentWithoutFrontmatter] = useState('')

  // Frontmatter state
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown> | null>(null)
  const [showFrontmatter, setShowFrontmatter] = useState(false)
  const [editingFrontmatter, setEditingFrontmatter] = useState<[string, string][]>([])
  const [isEditingFrontmatter, setIsEditingFrontmatter] = useState(false)

  // Performance refs
  const frontmatterParseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconstructTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInternalUpdate = useRef(false)
  const lastMarkdownRef = useRef('')
  const lastContentRef = useRef('')

  // Helper functions
  const convertToEditingFormat = (data: [string, unknown][]): [string, string][] => {
    return data.map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value)
    ])
  }

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
      }
    },
    [frontmatter, setMarkdown]
  )

  // Handle text changes with debouncing
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value

      if (newContent === lastContentRef.current) {
        return
      }

      lastContentRef.current = newContent
      setContentWithoutFrontmatter(newContent)

      if (reconstructTimeoutRef.current) {
        clearTimeout(reconstructTimeoutRef.current)
      }

      if (!frontmatter || Object.keys(frontmatter).length === 0) {
        isInternalUpdate.current = true
        setMarkdown(newContent)
        return
      }

      reconstructTimeoutRef.current = setTimeout(() => {
        reconstructMarkdownWithFrontmatter(newContent)
      }, 200)
    },
    [frontmatter, setMarkdown, reconstructMarkdownWithFrontmatter]
  )

  // Frontmatter actions
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

        if (trimmedValue === 'true' || trimmedValue === 'false') {
          processedFrontmatter[key] = trimmedValue === 'true'
        } else if (!isNaN(Number(trimmedValue)) && trimmedValue !== '') {
          processedFrontmatter[key] = Number(trimmedValue)
        } else {
          processedFrontmatter[key] = trimmedValue
        }
      })

      const result = await window.api.reverseGrayMatter(
        contentWithoutFrontmatter,
        processedFrontmatter
      )

      if (result.success && result.content) {
        setMarkdown(result.content)
        setFrontmatter(processedFrontmatter)
      } else {
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

  // Parse frontmatter when markdown changes
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    if (lastMarkdownRef.current === markdown) {
      return
    }

    lastMarkdownRef.current = markdown

    if (frontmatterParseTimeoutRef.current) {
      clearTimeout(frontmatterParseTimeoutRef.current)
    }

    frontmatterParseTimeoutRef.current = setTimeout(async () => {
      if (markdown && markdown.trim().startsWith('---')) {
        try {
          const result = await window.api.grayMatter(markdown)
          if (result.success && result.data) {
            setFrontmatter(result.data as Record<string, unknown>)
            const newContent = result.content || ''
            if (newContent !== contentWithoutFrontmatter) {
              setContentWithoutFrontmatter(newContent)
            }
            if (Object.keys(result.data as Record<string, unknown>).length > 0) {
              setShowFrontmatter(true)
            }
          } else {
            setFrontmatter(null)
            if (markdown !== contentWithoutFrontmatter) {
              setContentWithoutFrontmatter(markdown)
            }
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
    }, 500)

    return () => {
      if (frontmatterParseTimeoutRef.current) {
        clearTimeout(frontmatterParseTimeoutRef.current)
      }
    }
  }, [markdown, contentWithoutFrontmatter])

  return {
    // Content
    contentWithoutFrontmatter,
    setContentWithoutFrontmatter,
    handleTextChange,

    // Frontmatter state
    frontmatter,
    setFrontmatter,
    showFrontmatter,
    setShowFrontmatter,
    editingFrontmatter,
    setEditingFrontmatter,
    isEditingFrontmatter,
    setIsEditingFrontmatter,

    // Frontmatter actions
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
