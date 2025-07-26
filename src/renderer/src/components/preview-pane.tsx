import { Card } from './ui/card'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import { MermaidRenderer } from './mermaid'
import { Clock, Eye } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import { EditorStates } from '@renderer/lib/types'

interface PreviewPaneProps {
  states: EditorStates
  zoom: number
  markdown: string
}
export function PreviewPane({ states, markdown, zoom }: PreviewPaneProps) {
  return (
    <Card className="flex flex-col pt-0 scroll-auto overflow-auto max-h-full">
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span className="font-medium">Preview</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {states.documentStats.readingTime} min read
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div
          className="p-4 prose prose-sm max-w-none dark:prose-invert"
          style={{ fontSize: `${zoom / 100}rem` }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeHighlight, rehypeKatex]}
            components={{
              code: ({ className, children, node, ...props }) => {
                const match = /language-(\w+)/.exec(className || '')
                const language = match ? match[1] : ''
                const inline = !(
                  (className && className.includes('language-')) ||
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (node as any)?.parent?.tagName === 'pre'
                )
                if (!inline && language === 'mermaid') {
                  return <MermaidRenderer code={String(children).replace(/\n$/, '')} />
                }

                if (inline) {
                  return (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                }

                return (
                  <code
                    className={`block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto ${className || ''}`}
                    {...props}
                  >
                    {children}
                  </code>
                )
              },
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mb-4 text-foreground border-b pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mb-2 mt-4 text-foreground">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-foreground leading-relaxed">{children}</p>
              ),
              pre: ({ children }) => (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-1 text-foreground">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-1 text-foreground">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-foreground">{children}</li>,
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border-collapse border border-border">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-border bg-muted px-4 py-2 text-left font-semibold text-foreground">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-4 py-2 text-foreground">{children}</td>
              ),
              hr: () => <hr className="my-6 border-border" />,
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img src={src || '/placeholder.svg'} alt={alt} className="max-w-full h-auto" />
              )
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </ScrollArea>
    </Card>
  )
}
