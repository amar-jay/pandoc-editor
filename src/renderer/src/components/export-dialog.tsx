import { Download, FileText, Globe, FileType, FileSpreadsheet, Calculator } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Badge } from './ui/badge'

interface ExportDialogProps {
  currentFilePath: string
}
export const ExportDialog = ({ currentFilePath }: ExportDialogProps) => {
  return (
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
          <p className="text-sm text-muted-foreground mt-2">Choose your preferred export format</p>
        </DialogHeader>
        <div className="mt-6">
          {/* Export Format Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Markdown Export */}
            <Card
              className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
              onClick={async () => {
                const e = await window.api.openFile(currentFilePath)
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
                const result = await window.pandoc.toHTML(currentFilePath)
                if (result.success) {
                  window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')

                  if (result.outputPath) {
                    console.log('outputpath', result.outputPath)
                    const e = await window.api.openFile(result.outputPath)
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
                const result = await window.pandoc.toPDF(currentFilePath)
                if (result.success) {
                  window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')
                  if (result.outputPath) {
                    const e = await window.api.openFile(result.outputPath)
                    if (!e.success) {
                      window.api.showAlert(`Failed to open file: ${e.error}`, 'error')
                    }
                  }
                } else {
                  window.api.showAlert(`Failed to export to PDF. Emojis not supported yet.`, 'error')
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
                const result = await window.pandoc.toDOCX(currentFilePath)
                if (result.success) {
                  window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')
                  if (result.outputPath) {
                    const e = await window.api.openFile(result.outputPath)
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
                const result = await window.pandoc.toLaTeX(currentFilePath)
                if (result.success) {
                  window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')
                  if (result.outputPath) {
                    const e = await window.api.openFile(result.outputPath)
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
            {/* <Card
              className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
              onClick={() => handlers.exportFile('txt')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-900/20 flex-shrink-0">
                  <FileType2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium group-hover:text-foreground/90 text-sm">Plain Text</h4>
                  <p className="text-xs text-muted-foreground truncate">No formatting</p>
                </div>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  .txt
                </Badge>
              </div>
            </Card> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
