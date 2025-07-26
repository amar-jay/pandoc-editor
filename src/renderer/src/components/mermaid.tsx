import { useEffect, useState } from 'react'

import mermaid from 'mermaid'

// Initialize mermaid
mermaid.initialize({ startOnLoad: true, theme: 'default' })

export const MermaidRenderer = ({ code }: { code: string }) => {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        const { svg } = await mermaid.render('mermaid-' + Math.random(), code)
        setSvg(svg)
      } catch (error) {
        console.error('Mermaid rendering error:', error)
      }
    }
    renderMermaid()
  }, [code])

  return <div dangerouslySetInnerHTML={{ __html: svg }} />
}
