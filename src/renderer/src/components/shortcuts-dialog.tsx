import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Keyboard, File, Edit, Search, Eye } from 'lucide-react'

interface ShortcutsDialogProps {
  showShortcuts: boolean
  toggleShortcuts: () => void
}

interface ShortcutGroup {
  title: string
  icon: React.ReactNode
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'File Operations',
    icon: <File className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'N'], description: 'New file' },
      { keys: ['Ctrl', 'O'], description: 'Open file' },
      { keys: ['Ctrl', 'S'], description: 'Save file' },
      { keys: ['Ctrl', 'Shift', 'S'], description: 'Save as...' }
    ]
  },
  {
    title: 'Editing',
    icon: <Edit className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Ctrl', 'B'], description: 'Bold text' },
      { keys: ['Ctrl', 'I'], description: 'Italic text' }
    ]
  },
  {
    title: 'Search & Navigation',
    icon: <Search className="w-4 h-4" />,
    shortcuts: [
      { keys: ['Ctrl', 'F'], description: 'Find & replace' },
      { keys: ['Ctrl', '/'], description: 'Show shortcuts' }
    ]
  },
  {
    title: 'View',
    icon: <Eye className="w-4 h-4" />,
    shortcuts: [
      { keys: ['F11'], description: 'Toggle fullscreen' },
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' }
    ]
  }
]

function ShortcutKey({ shortcut }: { shortcut: string }) {
  return (
    <Badge variant="outline" className="px-2 py-1 text-xs font-mono bg-muted">
      {shortcut}
    </Badge>
  )
}

function ShortcutItem({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <div key={index} className="flex items-center gap-1">
            <ShortcutKey shortcut={key} />
            {index < keys.length - 1 && <span className="text-xs text-muted-foreground">+</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ShortcutsDialog({ showShortcuts, toggleShortcuts }: ShortcutsDialogProps) {
  return (
    <Dialog open={showShortcuts} onOpenChange={toggleShortcuts}>
      <DialogContent className="max-h-[80vh] !max-w-none w-[95vw] sm:w-[60vw] lg:w-[30vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutGroups.map((group, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2 font-medium text-sm border-b pb-2">
                  {group.icon}
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <ShortcutItem
                      key={shortcutIndex}
                      keys={shortcut.keys}
                      description={shortcut.description}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center mt-4">
          Press <ShortcutKey shortcut="Ctrl" /> + <ShortcutKey shortcut="/" /> to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  )
}
