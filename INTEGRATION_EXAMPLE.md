# Pandoc Export Integration Example

Here's how to replace the existing "Coming Soon" export functionality in the toolbar with the new Pandoc-based export system:

## 1. Update Toolbar Component

Replace the existing export dialog in `toolbar.tsx`:

```tsx
// At the top of the file, add the import
import { ExportDialog } from './export-dialog'

// In the component, replace the existing export Dialog with:
<ExportDialog 
  open={exportOpen}
  onOpenChange={setExportOpen}
  currentFilePath={states.currentFileName} // or however you get the current file path
/>

// And replace the DialogTrigger Button with:
<Button 
  variant="ghost" 
  size="sm" 
  title="Export" 
  onClick={() => setExportOpen(true)}
>
  <Download className="w-4 h-4" />
</Button>

// Add state for the export dialog
const [exportOpen, setExportOpen] = useState(false)
```

## 2. Quick Integration Example

If you want to quickly add Pandoc export functionality without the full dialog, you can replace the "Coming Soon" cards with direct conversion calls:

```tsx
// Replace the PDF Export Card with:
<Card
  className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
  onClick={async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'pandoc-quick-convert', 
        states.currentFileName, 
        'pdf'
      )
      
      if (result.success) {
        window.electron.ipcRenderer.invoke('show-alert', 
          \`PDF exported to \${result.outputPath}\`, 'info')
        
        // Optionally open the file
        await window.electron.ipcRenderer.invoke('open-converted-file', result.outputPath)
      } else {
        window.electron.ipcRenderer.invoke('show-alert', 
          \`Export failed: \${result.error}\`, 'error')
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }}
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/20">
        <FileType className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h4 className="font-medium">PDF</h4>
        <p className="text-sm text-muted-foreground">Portable document format</p>
      </div>
    </div>
    <Badge variant="secondary" className="text-xs">
      .pdf
    </Badge>
  </div>
</Card>

// Similar updates for LaTeX and DOCX cards...
```

## 3. Complete Integration

For the most comprehensive solution, replace the entire export section in the toolbar with:

```tsx
{/* Export Button */}
<Button
  variant="ghost"
  size="sm"
  onClick={() => setExportOpen(true)}
  title="Export Document"
  disabled={!states.currentFileName}
>
  <Download className="w-4 h-4" />
</Button>

{/* Export Dialog */}
<ExportDialog 
  open={exportOpen}
  onOpenChange={setExportOpen}
  currentFilePath={states.currentFileName}
/>
```

## 4. Add to Editor Hook

If you want to add export functionality to the editor hook, you can extend the `EditorHandlers` interface in `types.ts`:

```typescript
export interface EditorHandlers {
  // ... existing handlers
  exportToPDF: (options?: Partial<PandocOptions>) => Promise<void>
  exportToHTML: (options?: Partial<PandocOptions>) => Promise<void>
  exportToLaTeX: (options?: Partial<PandocOptions>) => Promise<void>
  exportToDOCX: (options?: Partial<PandocOptions>) => Promise<void>
  exportToEPUB: (options?: Partial<PandocOptions>) => Promise<void>
  openExportDialog: () => void
}
```

And implement them in the `editor-hook.ts`:

```typescript
import { pandocAPI } from '../lib/pandoc-api'

// In the hook implementation:
const exportToPDF = async (options?: Partial<PandocOptions>) => {
  if (!states.currentFileName) {
    window.electron.ipcRenderer.invoke('show-alert', 'No file is open', 'warning')
    return
  }

  const result = await pandocAPI.toPDF(states.currentFileName, undefined, options)
  
  if (result.success) {
    window.electron.ipcRenderer.invoke('show-alert', 
      \`PDF exported to \${result.outputPath}\`, 'info')
    await pandocAPI.openFile(result.outputPath!)
  } else {
    window.electron.ipcRenderer.invoke('show-alert', 
      \`Export failed: \${result.error}\`, 'error')
  }
}

// Similar implementations for other formats...

const openExportDialog = () => setExportOpen(true)

// Return in the hook:
return {
  // ... existing returns
  handlers: {
    // ... existing handlers
    exportToPDF,
    exportToHTML,
    exportToLaTeX,
    exportToDOCX,
    exportToEPUB,
    openExportDialog
  }
}
```

## 5. Keyboard Shortcuts

You can also add keyboard shortcuts for common export operations. In your main component or wherever you handle keyboard events:

```typescript
// Add to your keyboard event handler
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'e':
        if (e.shiftKey) {
          e.preventDefault()
          setExportOpen(true) // Open export dialog
        }
        break
      case 'p':
        if (e.shiftKey && e.altKey) {
          e.preventDefault()
          handlers.exportToPDF() // Quick PDF export
        }
        break
      // Add more shortcuts as needed
    }
  }
}
```

## 6. Context Menu Integration

You can also add export options to a context menu:

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ui/context-menu'

<ContextMenu>
  <ContextMenuTrigger>
    {/* Your editor or content */}
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onClick={() => handlers.exportToPDF()}>
      Export to PDF
    </ContextMenuItem>
    <ContextMenuItem onClick={() => handlers.exportToHTML()}>
      Export to HTML
    </ContextMenuItem>
    <ContextMenuItem onClick={() => handlers.exportToLaTeX()}>
      Export to LaTeX
    </ContextMenuItem>
    <ContextMenuItem onClick={() => setExportOpen(true)}>
      Export with Options...
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

This provides a comprehensive integration of the new Pandoc export functionality into your existing application architecture!
