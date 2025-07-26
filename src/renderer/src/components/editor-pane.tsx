import { BarChart3, Edit3 } from 'lucide-react'
import { Card } from './ui/card'
import { EditorSettings, EditorStates } from '@renderer/lib/types'

interface EditorPaneProps {
  states: EditorStates
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
  settings
}: EditorPaneProps) {
  return (
    <Card className="flex flex-col pt-0 scroll-auto overflow-auto max-h-full">
      <div className="flex items-center justify-between p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4" />
          <span className="font-medium">Editor</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="w-4 h-4" />
          {states.documentStats.words} words, {states.documentStats.characters} chars
        </div>
      </div>
      <div className="flex-1 p-0 relative">
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="w-full h-full p-4 resize-none border-0 outline-none bg-transparent font-mono leading-relaxed"
          placeholder="Start typing your markdown here..."
          spellCheck={settings.spellCheck}
          style={{
            fontSize: `${(settings.fontSize * zoom) / 100}px`,
            fontFamily: settings.fontFamily,
            lineHeight: settings.lineHeight,
            whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre'
          }}
        />
      </div>
    </Card>
  )
}
