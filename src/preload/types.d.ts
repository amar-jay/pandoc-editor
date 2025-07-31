import { ElectronAPI } from '@electron-toolkit/preload'
import { TreeNode } from '@renderer/types'
export type AlertTypes = 'info' | 'warning' | 'error'
interface MarkdownFilesResult {
  success: boolean
  files?: string[]
  error?: string
}

interface ReadFileResult {
  success: boolean
  content?: string
  fileName?: string
  error?: string
}

export interface PandocOptions {
  // Output format options
  outputFormat: 'pdf' | 'html' | 'latex' | 'docx' | 'epub' | 'odt' | 'rtf' | 'txt'

  // PDF specific options
  pdfEngine?:
    | 'pdflatex'
    | 'xelatex'
    | 'lualatex'
    | 'tectonic'
    | 'wkhtmltopdf'
    | 'weasyprint'
    | 'pagedjs-cli'

  // Bibliography options
  bibliography?: string // Path to .bib file
  csl?: string // Citation Style Language file

  // Template and styling
  template?: string
  css?: string // For HTML output

  // Font options
  mainfont?: string
  sansfont?: string
  monofont?: string
  mathfont?: string

  // Document options
  toc?: boolean // Table of contents
  tocDepth?: number
  numberSections?: boolean

  // Metadata
  title?: string
  author?: string
  date?: string

  // Additional Pandoc options
  standalone?: boolean
  selfContained?: boolean // For HTML

  // Custom variables
  variables?: Record<string, string>

  // Custom Pandoc arguments
  customArgs?: string[]
}

export interface ConversionResult {
  success: boolean
  outputPath?: string
  error?: string
  command?: string
}

export interface AvailableEnginesResponse {
  success: boolean
  engines?: string[]
  error?: string
}

/**
 * Pandoc API interface
 * Provides methods for converting markdown files to various formats using Pandoc.
 */
export interface PandocAPI {
  /**
   * Convert a markdown file using Pandoc with custom options
   */
  convert(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult>
  /**
   * Convert markdown to PDF
   */
  toPDF(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult>

  /**
   * Convert markdown to HTML
   */
  toHTML(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult>

  /**
   * Convert markdown to LaTeX
   */
  toLaTeX(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult>

  /**
   * Convert markdown to DOCX
   */
  toDOCX(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult>

  /**
   * Convert markdown to EPUB
   */
  toEPUB(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult>
}

export interface API {
  findMarkdownFiles: (dirPath?: string) => Promise<MarkdownFilesResult>
  readFileByPath: (filePath: string) => Promise<ReadFileResult>
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  getFileTree: (
    dirPath?: string
  ) => Promise<{ success: boolean; tree?: TreeNode[]; error?: string }>
  updateMarkdownFile: (
    filePath: string,
    content: string
  ) => Promise<{ success: boolean; error?: string }>
  fetchMarkdownFile: (
    filePath: string
  ) => Promise<{ success: boolean; content?: string; error?: string }>
  grayMatter: (content: string) => Promise<{
    success: boolean
    data?: unknown
    content?: string
    error?: string
  }>
  reverseGrayMatter: (
    content: string,
    frontmatter: Record<string, unknown>
  ) => Promise<{
    success: boolean
    content?: string
    error?: string
  }>

  showAlert: (message: string, type: AlertTypes = 'info' as AlertTypes) => Promise<void>
  openFile: (filePath: string) => Promise<{ success: boolean; error?: string }>
  showOpenDialog: () => Promise<{
    success: boolean
    filePath?: string
    canceled?: boolean
    error?: string
  }>
  getDefaultPath: () => Promise<{ success: boolean; path?: string; error?: string }>

  // Pandoc installation methods
  checkPandocInstalled: () => Promise<{ success: boolean; installed?: boolean; error?: string }>
  installPandoc: () => Promise<{ success: boolean; error?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    pandoc: PandocAPI
    api: API
  }
}
