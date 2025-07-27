import type { PandocOptions, ConversionResult, AvailableEnginesResponse } from '../../types'
// import { join, basename } from 'path'

// Electron IPC wrapper for Pandoc functions
export class PandocAPI {
  private static instance: PandocAPI

  static getInstance(): PandocAPI {
    if (!PandocAPI.instance) {
      PandocAPI.instance = new PandocAPI()
    }
    return PandocAPI.instance
  }

  /**
   * Convert a markdown file using Pandoc with custom options
   */
  async convert(
    inputPath: string,
    outputPath: string,
    options: PandocOptions
  ): Promise<ConversionResult> {
    return window.electron.ipcRenderer.invoke('pandoc-convert', inputPath, outputPath, options)
  }

  /**
   * Convert markdown to PDF
   */
  async toPDF(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return window.electron.ipcRenderer.invoke('pandoc-to-pdf', inputPath, outputPath, options)
  }

  /**
   * Convert markdown to HTML
   */
  async toHTML(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return window.electron.ipcRenderer.invoke('pandoc-to-html', inputPath, outputPath, options)
  }

  /**
   * Convert markdown to LaTeX
   */
  async toLaTeX(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return window.electron.ipcRenderer.invoke('pandoc-to-latex', inputPath, outputPath, options)
  }

  /**
   * Convert markdown to DOCX
   */
  async toDOCX(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return window.electron.ipcRenderer.invoke('pandoc-to-docx', inputPath, outputPath, options)
  }

  /**
   * Convert markdown to EPUB
   */
  async toEPUB(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return window.electron.ipcRenderer.invoke('pandoc-to-epub', inputPath, outputPath, options)
  }

  /**
   * Quick conversion with sensible defaults
   */
  async quickConvert(
    inputPath: string,
    format: 'pdf' | 'html' | 'latex' | 'docx' | 'epub',
    outputDir?: string
  ): Promise<ConversionResult> {
    return window.electron.ipcRenderer.invoke('pandoc-quick-convert', inputPath, format, outputDir)
  }

  /**
   * Open the converted file with system default application
   */
  async openFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    return window.electron.ipcRenderer.invoke('open-converted-file', filePath)
  }

  /**
   * Get available PDF engines on the system
   */
  async getAvailablePDFEngines(): Promise<AvailableEnginesResponse> {
    return window.electron.ipcRenderer.invoke('get-available-pdf-engines')
  }
}

// Export singleton instance
export const pandocAPI = PandocAPI.getInstance()

// Utility functions for common conversion tasks
export class PandocUtils {
  /**
   * Convert and open file in one step
   */
  static async convertAndOpen(
    inputPath: string,
    format: 'pdf' | 'html' | 'latex' | 'docx' | 'epub'
  ): Promise<ConversionResult> {
    const result = await pandocAPI.quickConvert(inputPath, format)

    if (result.success && result.outputPath) {
      await pandocAPI.openFile(result.outputPath)
    }

    return result
  }

  /**
   * Batch convert to multiple formats
   */
  static async batchConvert(
    inputPath: string,
    formats: Array<'pdf' | 'html' | 'latex' | 'docx' | 'epub'>,
    outputDir?: string
  ): Promise<ConversionResult[]> {
    const results = await Promise.allSettled(
      formats.map((format) => pandocAPI.quickConvert(inputPath, format, outputDir))
    )

    return results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            success: false,
            error: result.reason?.message || 'Conversion failed'
          }
    )
  }

  /**
   * Create academic paper PDF with common settings
   */
  static async createAcademicPDF(
    inputPath: string,
    outputPath?: string,
    bibliography?: string,
    csl?: string
  ): Promise<ConversionResult> {
    const options: Partial<PandocOptions> = {
      pdfEngine: 'pdflatex',
      toc: true,
      numberSections: true,
      bibliography,
      csl,
      variables: {
        geometry: 'margin=1in',
        fontsize: '12pt',
        spacing: 'double'
      }
    }

    return pandocAPI.toPDF(inputPath, outputPath, options)
  }

  /**
   * Create styled HTML with custom CSS
   */
  static async createStyledHTML(
    inputPath: string,
    outputPath?: string,
    cssPath?: string
  ): Promise<ConversionResult> {
    const options: Partial<PandocOptions> = {
      selfContained: true,
      toc: true,
      css: cssPath,
      variables: cssPath
        ? {
            'highlighting-css': '',
            css: cssPath
          }
        : undefined
    }

    return pandocAPI.toHTML(inputPath, outputPath, options)
  }

  /**
   * Create presentation-ready HTML
   */
  static async createPresentation(
    inputPath: string,
    outputPath?: string
  ): Promise<ConversionResult> {
    const options: Partial<PandocOptions> = {
      standalone: true,
      selfContained: true,
      variables: {
        theme: 'white',
        transition: 'slide',
        'slide-level': '2'
      }
    }

    return pandocAPI.toHTML(inputPath, outputPath, options)
  }

  /**
   * Get file extension for format
   */
  static getExtensionForFormat(format: string): string {
    const extensions: Record<string, string> = {
      pdf: '.pdf',
      html: '.html',
      latex: '.tex',
      docx: '.docx',
      epub: '.epub',
      odt: '.odt',
      rtf: '.rtf',
      txt: '.txt'
    }
    return extensions[format] || '.txt'
  }

  /**
   * Generate output path from input path and format
   */
  // static generateOutputPath(inputPath: string, format: string, outputDir?: string): string {
  //   const baseName = inputPath.replace(/\.[^.]+$/, '')
  //   const extension = this.getExtensionForFormat(format)
  //   const fileName = `${baseName}${extension}`

  //   if (outputDir) {
  //     return join(outputDir, basename(fileName))
  //   }

  //   return fileName
  // }
}
