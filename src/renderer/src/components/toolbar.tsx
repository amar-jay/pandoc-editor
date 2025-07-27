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
  Search,
  Globe,
  FileType2,
  FileType,
  Calculator,
  FileSpreadsheet
} from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { SettingsDialog } from './settings-dialog'
// import { MarkdownFileBrowser } from './markdown-file-browser'
import type { EditorSettings, EditorStates, SearchHandlers } from '@/types'
import type { useEditorHook } from './hooks/editor-hook'
import SaveFileAsDialog from './filepath-dialog'
import { pandocAPI } from '@renderer/lib/pandoc-api'

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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Document
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Choose your preferred export format
            </p>
          </DialogHeader>
          <div className="mt-6">
            {/* Export Format Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Markdown Export */}
              <Card
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={async () => {
                  const e = await pandocAPI.openFile(states.currentFilePath)
                  if (!e.success) {
                    window.api.showAlert(`Failed to open file: ${e.error}`, 'error')
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium group-hover:text-foreground/90 text-sm">Markdown</h4>
                    <p className="text-xs text-muted-foreground truncate">Original format</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    .md
                  </Badge>
                </div>
              </Card>

              {/* HTML Export */}
              <Card
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={async () => {
                  const result = await pandocAPI.quickConvert(states.currentFilePath, 'html')
                  if (result.success) {
                    window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')

                    if (result.outputPath) {
                      const e = await pandocAPI.openFile(result.outputPath)
                      if (!e.success) {
                        window.api.showAlert(`Failed to open file: ${e.error}`, 'error')
                      }
                    }
                  } else {
                    window.api.showAlert(`Failed to export: ${result.error}`, 'error')
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/20 flex-shrink-0">
                    <Globe className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium group-hover:text-foreground/90 text-sm">HTML</h4>
                    <p className="text-xs text-muted-foreground truncate">Web document</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    .html
                  </Badge>
                </div>
              </Card>

              {/* PDF Export */}
              <Card
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={async () => {
                  const result = await pandocAPI.quickConvert(states.currentFilePath, 'pdf')
                  if (result.success) {
                    window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')
                    if (result.outputPath) {
                      const e = await pandocAPI.openFile(result.outputPath)
                      if (!e.success) {
                        window.api.showAlert(`Failed to open file: ${e.error}`, 'error')
                      }
                    }
                  } else {
                    window.api.showAlert(`Failed to export: ${result.error}`, 'error')
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/20 flex-shrink-0">
                    <FileType className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium group-hover:text-foreground/90 text-sm">PDF</h4>
                    <p className="text-xs text-muted-foreground truncate">Portable format</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    .pdf
                  </Badge>
                </div>
              </Card>

              {/* Word Export */}
              <Card
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={async () => {
                  const result = await pandocAPI.quickConvert(states.currentFilePath, 'docx')
                  if (result.success) {
                    window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')
                    if (result.outputPath) {
                      const e = await pandocAPI.openFile(result.outputPath)
                      if (!e.success) {
                        window.api.showAlert(`Failed to open file: ${e.error}`, 'error')
                      }
                    }
                  } else {
                    window.api.showAlert(`Failed to export: ${result.error}`, 'error')
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium group-hover:text-foreground/90 text-sm">Word</h4>
                    <p className="text-xs text-muted-foreground truncate">Microsoft format</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    .docx
                  </Badge>
                </div>
              </Card>

              {/* LaTeX Export */}
              <Card
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={async () => {
                  const result = await pandocAPI.quickConvert(states.currentFilePath, 'latex')
                  if (result.success) {
                    window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')
                    if (result.outputPath) {
                      const e = await pandocAPI.openFile(result.outputPath)
                      if (!e.success) {
                        window.api.showAlert(`Failed to open file: ${e.error}`, 'error')
                      }
                    }
                  } else {
                    window.api.showAlert(`Failed to export: ${result.error}`, 'error')
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20 flex-shrink-0">
                    <Calculator className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium group-hover:text-foreground/90 text-sm">LaTeX</h4>
                    <p className="text-xs text-muted-foreground truncate">Scientific format</p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    .tex
                  </Badge>
                </div>
              </Card>

              {/* Text Export */}
              <Card
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handlers.exportFile('txt')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-900/20 flex-shrink-0">
                    <FileType2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium group-hover:text-foreground/90 text-sm">
                      Plain Text
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">No formatting</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    .txt
                  </Badge>
                </div>
              </Card>
            </div>
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
