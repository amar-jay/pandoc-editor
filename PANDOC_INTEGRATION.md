# Pandoc Integration Documentation

This document explains how to use the comprehensive Pandoc integration in the Pandoc Editor application.

## Overview

The Pandoc Editor now includes a full-featured Pandoc integration that allows you to convert your Markdown documents to various formats including PDF, HTML, LaTeX, DOCX, and EPUB with extensive customization options.

## Features

### Supported Output Formats
- **PDF** - Convert to PDF with multiple engine options
- **HTML** - Generate HTML with CSS styling and table of contents
- **LaTeX** - Export to LaTeX format for academic publishing
- **DOCX** - Microsoft Word format compatibility
- **EPUB** - E-book format for digital publishing

### Advanced Options
- **Bibliography support** - Include .bib files and citation styles (.csl)
- **Custom templates** - Use your own document templates
- **Font customization** - Set main, sans, and monospace fonts
- **Document metadata** - Title, author, date, and custom variables
- **PDF engine selection** - Choose between pdflatex, xelatex, lualatex, etc.
- **Table of contents** - Automatic generation with customizable depth
- **Section numbering** - Automatic section numbering

## Usage

### IPC Functions Available

The following IPC functions are available for use in the renderer process:

#### Basic Conversion Functions

```typescript
// Convert with full custom options
const result = await window.electron.ipcRenderer.invoke(
  'pandoc-convert', 
  inputPath, 
  outputPath, 
  options
)

// Quick conversions with sensible defaults
await window.electron.ipcRenderer.invoke('pandoc-to-pdf', inputPath, outputPath?, options?)
await window.electron.ipcRenderer.invoke('pandoc-to-html', inputPath, outputPath?, options?)
await window.electron.ipcRenderer.invoke('pandoc-to-latex', inputPath, outputPath?, options?)
await window.electron.ipcRenderer.invoke('pandoc-to-docx', inputPath, outputPath?, options?)
await window.electron.ipcRenderer.invoke('pandoc-to-epub', inputPath, outputPath?, options?)

// Quick convert with format parameter
await window.electron.ipcRenderer.invoke(
  'pandoc-quick-convert', 
  inputPath, 
  format, 
  outputDir?
)
```

#### Utility Functions

```typescript
// Open converted file with system default application
await window.electron.ipcRenderer.invoke('open-converted-file', filePath)

// Get available PDF engines on the system
const { engines } = await window.electron.ipcRenderer.invoke('get-available-pdf-engines')
```

### Using the Pandoc API

For easier integration, use the provided PandocAPI class:

```typescript
import { pandocAPI, PandocUtils } from '../lib/pandoc-api'

// Quick conversion
const result = await pandocAPI.quickConvert('/path/to/file.md', 'pdf')

// Convert with custom options
const result = await pandocAPI.toPDF('/path/to/file.md', '/path/to/output.pdf', {
  pdfEngine: 'xelatex',
  toc: true,
  numberSections: true,
  bibliography: '/path/to/references.bib',
  csl: '/path/to/style.csl'
})

// Convert and immediately open
await PandocUtils.convertAndOpen('/path/to/file.md', 'pdf')

// Batch convert to multiple formats
const results = await PandocUtils.batchConvert(
  '/path/to/file.md', 
  ['pdf', 'html', 'docx']
)

// Create academic paper with bibliography
await PandocUtils.createAcademicPDF(
  '/path/to/paper.md',
  '/path/to/paper.pdf',
  '/path/to/references.bib',
  '/path/to/apa.csl'
)
```

### Export Dialog Component

A comprehensive export dialog is available that provides a GUI for all conversion options:

```tsx
import { ExportDialog } from './components/export-dialog'

function MyComponent() {
  const [exportOpen, setExportOpen] = useState(false)
  const [currentFile, setCurrentFile] = useState('/path/to/current/file.md')

  return (
    <>
      <Button onClick={() => setExportOpen(true)}>
        Export Document
      </Button>
      
      <ExportDialog 
        open={exportOpen}
        onOpenChange={setExportOpen}
        currentFilePath={currentFile}
      />
    </>
  )
}
```

## Configuration Options

### PandocOptions Interface

```typescript
interface PandocOptions {
  // Required
  outputFormat: 'pdf' | 'html' | 'latex' | 'docx' | 'epub' | 'odt' | 'rtf' | 'txt'
  
  // PDF specific
  pdfEngine?: 'pdflatex' | 'xelatex' | 'lualatex' | 'tectonic' | 'wkhtmltopdf' | 'weasyprint'
  
  // Bibliography
  bibliography?: string  // Path to .bib file
  csl?: string          // Citation Style Language file
  
  // Styling
  template?: string     // Custom template path
  css?: string         // CSS file for HTML output
  
  // Fonts
  mainfont?: string    // Main document font
  sansfont?: string    // Sans-serif font
  monofont?: string    // Monospace font
  mathfont?: string    // Math font
  
  // Document structure
  toc?: boolean        // Include table of contents
  tocDepth?: number    // TOC depth level
  numberSections?: boolean  // Number sections automatically
  
  // Metadata
  title?: string
  author?: string
  date?: string
  
  // Advanced
  standalone?: boolean      // Generate standalone document
  selfContained?: boolean   // Embed resources (HTML)
  variables?: Record<string, string>  // Custom variables
  customArgs?: string[]     // Additional Pandoc arguments
}
```

## Examples

### Basic PDF Export

```typescript
const result = await pandocAPI.toPDF('/home/user/document.md')
if (result.success) {
  console.log('PDF created at:', result.outputPath)
  await pandocAPI.openFile(result.outputPath)
}
```

### Academic Paper with Bibliography

```typescript
const options = {
  pdfEngine: 'xelatex' as const,
  toc: true,
  numberSections: true,
  bibliography: '/home/user/references.bib',
  csl: '/home/user/apa.csl',
  mainfont: 'Times New Roman',
  variables: {
    geometry: 'margin=1in',
    fontsize: '12pt',
    spacing: 'double'
  }
}

const result = await pandocAPI.toPDF(
  '/home/user/paper.md',
  '/home/user/paper.pdf',
  options
)
```

### Styled HTML with Custom CSS

```typescript
const result = await PandocUtils.createStyledHTML(
  '/home/user/document.md',
  '/home/user/document.html',
  '/home/user/custom.css'
)
```

### Batch Export

```typescript
const results = await PandocUtils.batchConvert(
  '/home/user/document.md',
  ['pdf', 'html', 'docx', 'epub'],
  '/home/user/exports/'
)

results.forEach((result, index) => {
  const format = ['pdf', 'html', 'docx', 'epub'][index]
  if (result.success) {
    console.log(\`\${format} export successful: \${result.outputPath}\`)
  } else {
    console.error(\`\${format} export failed: \${result.error}\`)
  }
})
```

## Error Handling

All conversion functions return a `ConversionResult` object:

```typescript
interface ConversionResult {
  success: boolean
  outputPath?: string  // Path to generated file if successful
  error?: string      // Error message if failed
  command?: string    // Pandoc command that was executed
}
```

Always check the `success` property before using the result:

```typescript
const result = await pandocAPI.toPDF('/path/to/file.md')

if (result.success) {
  // Success - use result.outputPath
  console.log('File created:', result.outputPath)
  await pandocAPI.openFile(result.outputPath)
} else {
  // Error - show result.error
  console.error('Conversion failed:', result.error)
  // Optionally show the command that failed
  console.log('Command:', result.command)
}
```

## Integration with Toolbar

To add an export button to the toolbar, you can modify the toolbar component:

```tsx
// In toolbar.tsx
import { Download } from 'lucide-react'
import { ExportDialog } from './export-dialog'

// Add state for export dialog
const [exportOpen, setExportOpen] = useState(false)

// Add button to toolbar
<Button
  variant="ghost"
  size="sm"
  onClick={() => setExportOpen(true)}
  title="Export Document"
>
  <Download className="h-4 w-4" />
</Button>

// Add dialog to component
<ExportDialog 
  open={exportOpen}
  onOpenChange={setExportOpen}
  currentFilePath={states.currentFileName}
/>
```

## Tips and Best Practices

1. **PDF Engines**: Use `xelatex` or `lualatex` for better Unicode and font support
2. **Bibliography**: Place `.bib` and `.csl` files in the same directory as your markdown file
3. **Templates**: Create custom templates for consistent styling across documents
4. **Error Debugging**: Check the `command` property in failed results to see the exact Pandoc command
5. **Performance**: Use `quickConvert` for simple conversions with default settings
6. **Batch Operations**: Use `PandocUtils.batchConvert` for multiple format exports

## Dependencies

The Pandoc integration requires:
- Pandoc binary (bundled with the application in `resources/pandoc/bin/`)
- For PDF output: LaTeX distribution (pdflatex, xelatex, or lualatex)
- For bibliography: Pandoc-citeproc (included with Pandoc)

The application will automatically detect available PDF engines and provide appropriate options in the export dialog.
