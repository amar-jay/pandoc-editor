import { useEffect, useState } from 'react'

import mermaid from 'mermaid'

// Initialize mermaid
mermaid.initialize({ startOnLoad: true, theme: 'default' })

export const MermaidRenderer = ({ code }: { code: string }) => {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        // Generate a valid ID using timestamp and random number
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        const { svg } = await mermaid.render(id, code)
        setSvg(svg)
      } catch (error) {
        console.error('Mermaid rendering error:', error)
      }
    }
    renderMermaid()
  }, [code])

  return <div dangerouslySetInnerHTML={{ __html: svg }} />
}
