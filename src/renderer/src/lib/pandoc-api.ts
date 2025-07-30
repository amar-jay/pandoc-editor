import path from 'path'
import type { PandocOptions, ConversionResult } from '../../types'

// Utility functions for common conversion tasks
export class PandocUtils {
  /**
   * Batch convert to multiple formats
   */
  static async batchConvert(
    inputPath: string,
    options: Partial<PandocOptions>[] = [],
    outputDir?: string
  ): Promise<ConversionResult[]> {
    const generateOutputPath = (format?: string) => {
      if (!format) {
        format = 'pdf'
      }
      let outputPath = inputPath.replace(/\.md$/, '.' + format)
      if (outputDir) {
        outputPath = path.join(outputDir, path.basename(outputPath))
      }
      return outputPath
    }
    const results = await Promise.allSettled(
      options.map((opts) =>
        window.pandoc.convert(inputPath, generateOutputPath(opts.outputFormat), opts)
      )
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

    return window.pandoc.toPDF(inputPath, outputPath, options)
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

    return window.pandoc.toHTML(inputPath, outputPath, options)
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

    return window.pandoc.toHTML(inputPath, outputPath, options)
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
