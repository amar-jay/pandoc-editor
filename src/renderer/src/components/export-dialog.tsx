import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { pandocAPI } from '../lib/pandoc-api'
import type { PandocOptions } from '../../types'
import { Download } from 'lucide-react'

interface ExportDialogProps {
  currentFilePath: string
}

export function ExportDialog({ currentFilePath }: ExportDialogProps) {
  const [open, onOpenChange] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'html' | 'latex' | 'docx' | 'epub'>('pdf')
  const [outputPath, setOutputPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // PDF Options
  const [pdfEngine, setPdfEngine] = useState<'pdflatex' | 'xelatex' | 'lualatex'>('pdflatex')

  // Document Options
  const [includeToC, setIncludeToC] = useState(true)
  const [numberSections, setNumberSections] = useState(true)
  const [standalone, setStandalone] = useState(true)

  // Bibliography
  const [bibliography, setBibliography] = useState('')
  const [csl, setCsl] = useState('')

  // Template and styling
  const [template, setTemplate] = useState('')
  const [css, setCss] = useState('')

  // Fonts
  const [mainFont, setMainFont] = useState('')
  const [sansFont, setSansFont] = useState('')
  const [monoFont, setMonoFont] = useState('')

  // Metadata
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [date, setDate] = useState('')

  const handleExport = async () => {
    if (!currentFilePath) {
      window.api.showAlert('No file is currently open', 'warning')
      return
    }

    setIsLoading(true)

    try {
      const options: Partial<PandocOptions> = {
        outputFormat: format,
        toc: includeToC,
        numberSections,
        standalone,
        ...(format === 'pdf' && { pdfEngine }),
        ...(bibliography && { bibliography }),
        ...(csl && { csl }),
        ...(template && { template }),
        ...(css && { css }),
        ...(mainFont && { mainfont: mainFont }),
        ...(sansFont && { sansfont: sansFont }),
        ...(monoFont && { monofont: monoFont }),
        ...(title && { title }),
        ...(author && { author }),
        ...(date && { date })
      }

      const result = outputPath
        ? await pandocAPI.convert(currentFilePath, outputPath, options as PandocOptions)
        : await pandocAPI.quickConvert(currentFilePath, format)

      if (result.success) {
        window.api.showAlert(`Successfully exported to ${result.outputPath}`, 'info')

        // Offer to open the file
        const shouldOpen = confirm('Export successful! Would you like to open the file?')
        if (shouldOpen && result.outputPath) {
          const e = await pandocAPI.openFile(result.outputPath)
          if (!e.success) {
            window.api.showAlert(`Failed to open file: ${e.error}`, 'error')
          }
        }

        onOpenChange(false)
      } else {
        window.api.showAlert(`Export failed: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Export error:', error)
      window.api.showAlert(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setOutputPath('')
    setIncludeToC(true)
    setNumberSections(true)
    setStandalone(true)
    setBibliography('')
    setCsl('')
    setTemplate('')
    setCss('')
    setMainFont('')
    setSansFont('')
    setMonoFont('')
    setTitle('')
    setAuthor('')
    setDate('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Export">
          <Download className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format">Output Format</Label>
            <Select
              value={format}
              onValueChange={(value: 'pdf' | 'html' | 'latex' | 'docx' | 'epub') =>
                setFormat(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="latex">LaTeX</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="epub">EPUB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Output Path */}
          <div className="space-y-2">
            <Label htmlFor="output-path">Output Path (optional)</Label>
            <Input
              id="output-path"
              placeholder="Leave empty for automatic naming"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
            />
          </div>

          <Separator />

          {/* PDF Engine (only for PDF) */}
          {format === 'pdf' && (
            <div className="space-y-2">
              <Label htmlFor="pdf-engine">PDF Engine</Label>
              <Select
                value={pdfEngine}
                onValueChange={(value: 'pdflatex' | 'xelatex' | 'lualatex') => setPdfEngine(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdflatex">PDFLaTeX</SelectItem>
                  <SelectItem value="xelatex">XeLaTeX</SelectItem>
                  <SelectItem value="lualatex">LuaLaTeX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Document Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Document Options</h3>

            <div className="flex items-center space-x-2">
              <Switch id="toc" checked={includeToC} onCheckedChange={setIncludeToC} />
              <Label htmlFor="toc">Include Table of Contents</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="number-sections"
                checked={numberSections}
                onCheckedChange={setNumberSections}
              />
              <Label htmlFor="number-sections">Number Sections</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="standalone" checked={standalone} onCheckedChange={setStandalone} />
              <Label htmlFor="standalone">Standalone Document</Label>
            </div>
          </div>

          <Separator />

          {/* Bibliography */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Bibliography</h3>

            <div className="space-y-2">
              <Label htmlFor="bibliography">Bibliography File (.bib)</Label>
              <Input
                id="bibliography"
                placeholder="Path to .bib file"
                value={bibliography}
                onChange={(e) => setBibliography(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="csl">Citation Style (.csl)</Label>
              <Input
                id="csl"
                placeholder="Path to .csl file"
                value={csl}
                onChange={(e) => setCsl(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Template and Styling */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Template & Styling</h3>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Input
                id="template"
                placeholder="Path to template file"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              />
            </div>

            {(format === 'html' || format === 'epub') && (
              <div className="space-y-2">
                <Label htmlFor="css">CSS File</Label>
                <Input
                  id="css"
                  placeholder="Path to CSS file"
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Fonts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Fonts</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="main-font">Main Font</Label>
                <Input
                  id="main-font"
                  placeholder="e.g., Times New Roman"
                  value={mainFont}
                  onChange={(e) => setMainFont(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sans-font">Sans Font</Label>
                <Input
                  id="sans-font"
                  placeholder="e.g., Arial"
                  value={sansFont}
                  onChange={(e) => setSansFont(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mono-font">Mono Font</Label>
                <Input
                  id="mono-font"
                  placeholder="e.g., Courier New"
                  value={monoFont}
                  onChange={(e) => setMonoFont(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Metadata</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Document title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  placeholder="Publication date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>

            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isLoading}>
                {isLoading ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
