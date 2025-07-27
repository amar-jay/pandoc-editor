import { exec } from 'child_process'
import { promisify } from 'util'
import { shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { getFilePath } from './utils'

const execAsync = promisify(exec)

// Path to the bundled Pandoc executable
const PANDOC_PATH = path.join(__dirname, '../../resources/pandoc/bin/pandoc')

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

/**
 * Convert a markdown file using Pandoc with various options
 */
export async function convertWithPandoc(
  inputPath: string,
  outputPath: string,
  options: PandocOptions
): Promise<ConversionResult> {
  try {
    inputPath = await getFilePath(inputPath)
    // Ensure input file exists
    if (!fs.existsSync(inputPath)) {
      return {
        success: false,
        error: `Input file does not exist: ${inputPath}`
      }
    }

    // Create output directory if it doesn't exist
    outputPath = await getFilePath(outputPath, true)

    // Build Pandoc command
    const command = buildPandocCommand(inputPath, outputPath, options)

    console.log('Executing Pandoc command:', command)

    // Execute the command
    const { stderr } = await execAsync(command)

    if (stderr && !stderr.includes('Warning')) {
      console.warn('Pandoc stderr:', stderr)
    }

    // Check if output file was created
    if (fs.existsSync(outputPath)) {
      return {
        success: true,
        outputPath,
        command
      }
    } else {
      return {
        success: false,
        error: 'Output file was not created',
        command
      }
    }
  } catch (error) {
    console.error('Pandoc conversion error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Build the Pandoc command string based on options
 */
function buildPandocCommand(inputPath: string, outputPath: string, options: PandocOptions): string {
  const args: string[] = [`"${PANDOC_PATH}"`, `"${inputPath}"`, '-o', `"${outputPath}"`]

  // PDF engine
  if (options.outputFormat === 'pdf' && options.pdfEngine) {
    args.push(`--pdf-engine=${options.pdfEngine}`)
  }

  // Bibliography
  if (options.bibliography) {
    args.push(`--bibliography="${options.bibliography}"`)
  }

  // Citation style
  if (options.csl) {
    args.push(`--csl="${options.csl}"`)
  }

  // Template
  if (options.template) {
    args.push(`--template="${options.template}"`)
  }

  // CSS for HTML
  if (options.css && (options.outputFormat === 'html' || options.outputFormat === 'epub')) {
    args.push(`--css="${options.css}"`)
  }

  // Fonts
  if (options.mainfont) {
    args.push(`--variable=mainfont:"${options.mainfont}"`)
  }
  if (options.sansfont) {
    args.push(`--variable=sansfont:"${options.sansfont}"`)
  }
  if (options.monofont) {
    args.push(`--variable=monofont:"${options.monofont}"`)
  }
  if (options.mathfont) {
    args.push(`--variable=mathfont:"${options.mathfont}"`)
  }

  // Table of contents
  if (options.toc) {
    args.push('--toc')
    if (options.tocDepth) {
      args.push(`--toc-depth=${options.tocDepth}`)
    }
  }

  // Number sections
  if (options.numberSections) {
    args.push('--number-sections')
  }

  // Metadata
  if (options.title) {
    args.push(`--metadata=title:"${options.title}"`)
  }
  if (options.author) {
    args.push(`--metadata=author:"${options.author}"`)
  }
  if (options.date) {
    args.push(`--metadata=date:"${options.date}"`)
  }

  // Standalone document
  if (options.standalone !== false) {
    args.push('--standalone')
  }

  // Self-contained (for HTML)
  if (options.selfContained && options.outputFormat === 'html') {
    args.push('--self-contained')
  }

  // Custom variables
  if (options.variables) {
    Object.entries(options.variables).forEach(([key, value]) => {
      args.push(`--variable=${key}:"${value}"`)
    })
  }

  // Custom arguments
  if (options.customArgs) {
    args.push(...options.customArgs)
  }

  return args.join(' ')
}

/**
 * Convert markdown to PDF with common academic settings
 */
export async function convertToPDF(
  inputPath: string,
  outputPath?: string,
  options: Partial<PandocOptions> = {}
): Promise<ConversionResult> {
  if (!outputPath) {
    outputPath = inputPath.replace(/\.md$/, '.pdf')
  }

  const defaultOptions: PandocOptions = {
    outputFormat: 'pdf',
    pdfEngine: 'pdflatex',
    toc: true,
    numberSections: true,
    standalone: true,
    ...options
  }

  return convertWithPandoc(inputPath, outputPath, defaultOptions)
}

/**
 * Convert markdown to HTML with styling
 */
export async function convertToHTML(
  inputPath: string,
  outputPath?: string,
  options: Partial<PandocOptions> = {}
): Promise<ConversionResult> {
  console.log('Converting to HTML:', inputPath, outputPath, options)
  if (!outputPath) {
    outputPath = inputPath.replace(/\.md$/, '.html')
  }

  const defaultOptions: PandocOptions = {
    outputFormat: 'html',
    standalone: true,
    selfContained: true,
    toc: true,
    ...options
  }

  return convertWithPandoc(inputPath, outputPath, defaultOptions)
}

/**
 * Convert markdown to LaTeX
 */
export async function convertToLaTeX(
  inputPath: string,
  outputPath?: string,
  options: Partial<PandocOptions> = {}
): Promise<ConversionResult> {
  if (!outputPath) {
    outputPath = inputPath.replace(/\.md$/, '.tex')
  }

  const defaultOptions: PandocOptions = {
    outputFormat: 'latex',
    standalone: true,
    ...options
  }

  return convertWithPandoc(inputPath, outputPath, defaultOptions)
}

/**
 * Convert markdown to DOCX
 */
export async function convertToDOCX(
  inputPath: string,
  outputPath?: string,
  options: Partial<PandocOptions> = {}
): Promise<ConversionResult> {
  if (!outputPath) {
    outputPath = inputPath.replace(/\.md$/, '.docx')
  }

  const defaultOptions: PandocOptions = {
    outputFormat: 'docx',
    ...options
  }

  return convertWithPandoc(inputPath, outputPath, defaultOptions)
}

/**
 * Convert markdown to EPUB
 */
export async function convertToEPUB(
  inputPath: string,
  outputPath?: string,
  options: Partial<PandocOptions> = {}
): Promise<ConversionResult> {
  if (!outputPath) {
    outputPath = inputPath.replace(/\.md$/, '.epub')
  }

  const defaultOptions: PandocOptions = {
    outputFormat: 'epub',
    ...options
  }

  return convertWithPandoc(inputPath, outputPath, defaultOptions)
}

/**
 * Open the converted file with the system default application
 */
export async function openConvertedFile(filePath: string): Promise<void> {
  try {
    await shell.openPath(filePath)
  } catch (error) {
    console.error('Error opening file:', error)
    throw new Error(`Failed to open file: ${filePath}`)
  }
}

/**
 * Get available PDF engines on the system
 */
export async function getAvailablePDFEngines(): Promise<string[]> {
  const engines = ['pdflatex', 'xelatex', 'lualatex', 'tectonic', 'wkhtmltopdf', 'weasyprint']
  const available: string[] = []

  for (const engine of engines) {
    try {
      await execAsync(`which ${engine}`)
      available.push(engine)
    } catch {
      // Engine not available
    }
  }

  return available
}

/**
 * Quick conversion with sensible defaults
 */
export async function quickConvert(
  inputPath: string,
  format: 'pdf' | 'html' | 'latex' | 'docx' | 'epub',
  outputDir?: string
): Promise<ConversionResult> {
  const basename = path.basename(inputPath, '.md')
  const outputPath = outputDir
    ? path.join(outputDir, `${basename}.${format === 'latex' ? 'tex' : format}`)
    : inputPath.replace(/\.md$/, `.${format === 'latex' ? 'tex' : format}`)

  console.log(`Quick converting ${inputPath} to ${outputPath} as ${format}`)

  switch (format) {
    case 'pdf':
      return convertToPDF(inputPath, outputPath)
    case 'html':
      return convertToHTML(inputPath, outputPath)
    case 'latex':
      return convertToLaTeX(inputPath, outputPath)
    case 'docx':
      return convertToDOCX(inputPath, outputPath)
    case 'epub':
      return convertToEPUB(inputPath, outputPath)
    default:
      return {
        success: false,
        error: `Unsupported format: ${format}`
      }
  }
}
