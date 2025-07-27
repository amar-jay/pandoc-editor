import {
  FileText,
  Upload,
  Save,
  Eye,
  Edit3,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Copy,
  Check,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  SplitSquareHorizontal,
  Undo,
  Redo,
  FileDown,
  Search
} from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { SettingsDialog } from './settings-dialog'
// import { MarkdownFileBrowser } from './markdown-file-browser'
import { EditorSettings, EditorStates, SearchHandlers } from '@renderer/lib/types'
import type { useEditorHook } from './hooks/editor-hook'
import SaveFileAsDialog from './filepath-dialog'

interface ToolbarProps {
  search: SearchHandlers
  states: EditorStates
  handlers: ReturnType<typeof useEditorHook>['handlers']
  settings: EditorSettings
  zoom: number
  setZoom: (value: number) => void
  viewMode: 'edit' | 'preview' | 'split'
  setViewMode: (mode: 'edit' | 'preview' | 'split') => void
}
export function Toolbar({
  search,
  states,
  handlers,
  settings,
  zoom,
  setZoom,
  viewMode,
  setViewMode
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 pr-5">
      {/* File Operations */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlers.createNewFile}
        className=" hidden lg:block"
        title="New (Ctrl+N)"
      >
        <FileText className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handlers.openFile}
        className=" hidden lg:block"
        title="Open (Ctrl+O)"
      >
        <Upload className="w-4 h-4" />
      </Button>
      {/* <MarkdownFileBrowser onFileSelect={handlers.handleFileSelect} /> */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlers.saveFile}
        className=" hidden lg:block"
        title="Save (Ctrl+S)"
      >
        <Save className="w-4 h-4" />
      </Button>
      <SaveFileAsDialog saveFileAs={handlers.saveFileAs} />

      <Separator orientation="vertical" className="h-6 border-2 hidden lg:block" />

      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlers.undo}
        disabled={states.undoStack.length === 0}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handlers.redo}
        disabled={states.redoStack.length === 0}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 border-2" />

      {/* Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('**', '**')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('*', '*')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('~~', '~~')}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('`', '`')}
        title="Inline Code"
        className=" hidden lg:block"
      >
        <Code className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 border-2 hidden lg:block" />

      {/* Structure */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('# ', '')}
        title="Heading 1"
        className=" hidden lg:block"
      >
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('## ', '')}
        title="Heading 2"
        className=" hidden lg:block"
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('### ', '')}
        title="Heading 3"
        className=" hidden lg:block"
      >
        <Heading3 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('- ', '')}
        title="Bullet List"
        className=" hidden lg:block"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('1. ', '')}
        title="Numbered List"
        className=" hidden lg:block"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.insertMarkdown('> ', '')}
        title="Quote"
        className=" hidden lg:block"
      >
        <Quote className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 border-2 hidden lg:block" />

      {/* View Controls */}
      <div className="lg:flex items-center gap-1 bg-muted rounded-md hidden">
        <Button
          variant={viewMode === 'edit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('edit')}
          title="Edit Only"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'split' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('split')}
          title="Split View"
        >
          <SplitSquareHorizontal className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'preview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('preview')}
          title="Preview Only"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 border-2" />

      {/* Zoom Controls */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setZoom(Math.max(50, zoom - 10))}
        title="Zoom Out"
        className=" hidden lg:block"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <span className="text-sm text-muted-foreground min-w-[3rem] text-center hidden lg:block">
        {zoom}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setZoom(Math.min(200, zoom + 10))}
        title="Zoom In"
        className=" hidden lg:block"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 border-2  hidden lg:block" />

      {/* Utility Buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => search.toggleSearch()}
        title="Search (Ctrl+F)"
      >
        <Search className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handlers.copyToClipboard}
        title="Copy to Clipboard"
      >
        {states.copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>

      {/* Export Menu */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" title="Export">
            <Download className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Button onClick={() => handlers.exportFile('md')} className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Export as Markdown (.md)
            </Button>
            <Button onClick={() => handlers.exportFile('html')} className="justify-start">
              <FileDown className="w-4 h-4 mr-2" />
              Export as HTML (.html)
            </Button>
            <Button onClick={() => handlers.exportFile('txt')} className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Export as Text (.txt)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <SettingsDialog
        settings={settings}
        updateSettings={handlers.updateSettings}
        toggleSettingsDialog={handlers.toggleSettingsDialog}
        recentFiles={states.recentFiles}
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handlers.toggleFullscreen()}
        title="Toggle Fullscreen (F11)"
      >
        {states.isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </Button>
    </div>
  )
}
