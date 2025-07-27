'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useKeyboardShortcuts } from './hooks/editor-hook'
import { PreviewPane } from './preview-pane'
import { EditorPane } from './editor-pane'
import { Toolbar } from './toolbar'
import { EditorHookReturn } from '@/types'

export default function AdvancedMarkdownEditor({
  editorStates
}: {
  editorStates: EditorHookReturn
}): React.JSX.Element {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split')
  const [zoom, setZoom] = useState(100)
  const { states, search, handlers, settings, refs, markdown } = editorStates

  useKeyboardShortcuts(handlers, search.toggleSearch)
  return (
    <div
      className={`min-h-screen bg-background transition-all duration-300 ${states.isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {states.currentFileName}
                {states.isModified && '*'}
              </span>
            </div>

            {/* Toolbar */}
            <Toolbar
              search={search}
              states={states}
              handlers={handlers}
              settings={settings}
              zoom={zoom}
              setZoom={setZoom}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {search.showSearch && (
        <div className="absolute top-20 border-2 left-1/2 transform -translate-x-1/2 flex items-center max-w-xl gap-2 p-2 bg-muted rounded-md z-50 shadow-md">
          <Search className="w-4 h-4" />
          <Input
            placeholder="Search..."
            value={states.searchTerm}
            onChange={(e) => search.setSearchTerm(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && search.search()}
          />
          <Input
            placeholder="Replace..."
            value={states.replaceTerm}
            onChange={(e) => search.setReplaceTerm(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={search.search}>
            Find
          </Button>
          <Button size="sm" onClick={search.replaceAll}>
            Replace All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => search.toggleSearch()}
            className="cursor-pointer hover:bg-red-100 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div
          className={`grid gap-4 h-[calc(100vh-140px)] ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {/* Editor Pane */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <EditorPane
              states={states}
              textareaRef={refs.textareaRef}
              markdown={markdown}
              setMarkdown={handlers.setMarkdown}
              zoom={zoom}
              settings={settings}
            />
          )}

          {/* Preview Pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <PreviewPane markdown={markdown} zoom={zoom} states={states} />
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-4 p-2 bg-primary/90 text-secondary rounded-md text-xs dark:text-secondary-foreground">
          <div className="flex items-center gap-4">
            <span>Words: {states.documentStats.words}</span>
            <span>Char: {states.documentStats.characters}</span>
            <span>Paragraphs: {states.documentStats.paragraphs}</span>
            <span>Time: {states.documentStats.readingTime} min</span>
          </div>
          <div className="flex items-center gap-4">
            {settings.autoSave && <span>Auto-save: ON</span>}
            <span>Zoom: {zoom}%</span>
            <span>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} mode</span>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={refs.fileInputRef}
        type="file"
        accept=".md,.txt"
        onChange={handlers.handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
