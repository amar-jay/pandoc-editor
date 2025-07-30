import {
  FileText,
  Upload,
  Save,
  Eye,
  Edit3,
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
  Search
} from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { SettingsDialog } from './settings-dialog'
// import { MarkdownFileBrowser } from './markdown-file-browser'
import type { EditorSettings, EditorStates, SearchHandlers } from '@/types'
import type { useEditorHook } from './hooks/editor-hook'
import SaveFileAsDialog from './filepath-dialog'
import { ExportDialog } from './export-dialog'

interface ToolbarProps {
  search: SearchHandlers
  states: EditorStates
  handlers: ReturnType<typeof useEditorHook>['handlers']
  settings: EditorSettings
  viewMode: 'edit' | 'preview' | 'split'
  setViewMode: (mode: 'edit' | 'preview' | 'split') => void
}
export function Toolbar({
  search,
  states,
  handlers,
  settings,
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
      <SaveFileAsDialog
        open={states.isSaveFileAsDialogOpen}
        setOpen={handlers.toggleSaveFileAsDialog}
        saveFileAs={handlers.saveFileAs}
      />

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
        onClick={handlers.zoomOut}
        title="Zoom Out"
        className=" hidden lg:block"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <span
        className="text-sm text-muted-foreground min-w-[3rem] text-center hidden lg:block"
        title="Double Click to reset zoom"
        onDoubleClick={handlers.resetZoom}
      >
        {states.zoom}%
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handlers.zoomIn}
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
      <ExportDialog currentFilePath={states.currentFilePath} />

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
