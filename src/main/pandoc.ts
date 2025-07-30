import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import { getFilePath } from './filesystem'
import { getPandocPath } from './install-pandoc'
import type { ConversionResult, PandocOptions } from '../preload/types'

const execAsync = promisify(exec)

const DEFAULT_OPTIONS: PandocOptions = {
  outputFormat: 'pdf',
  pdfEngine: 'pdflatex',
  toc: false,
  numberSections: true,
  standalone: true
}
const pandoc_path = getPandocPath()
/**
 * Build the Pandoc command string based on options
 */
function buildPandocCommand(inputPath: string, outputPath: string, options: PandocOptions): string {
  const args: string[] = [`"${pandoc_path}"`, `"${inputPath}"`, '-o', `"${outputPath}"`]

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
 * Convert a markdown file using Pandoc with various options. By default, it converts to PDF.
 */
export async function convertWithPandoc(
  inputPath: string,
  outputPath?: string,
  options: Partial<PandocOptions> = {}
): Promise<ConversionResult> {
  try {
    if (Object.entries(options).length == 0) {
      options = DEFAULT_OPTIONS
    }
    if (!options.outputFormat) {
      return {
        success: false,
        error: 'Output format is required'
      }
    }
    inputPath = await getFilePath(inputPath)

    if (!outputPath) {
      outputPath = inputPath.replace(/\.md$/, '.' + options.outputFormat)
      console.log('\n\nTHE OUTPUT PATH IS ', outputPath)
    }

    // Ensure input file exists
    if (!fs.existsSync(inputPath)) {
      return {
        success: false,
        error: `Input file does not exist: ${inputPath}`
      }
    }

    // Create output directory if it doesn't exist
    outputPath = await getFilePath(outputPath, true)

    console.log('\n\nTHE OUTPUT PATH IS (2)', outputPath)

    // Build Pandoc command
    const command = buildPandocCommand(inputPath, outputPath, {
      ...DEFAULT_OPTIONS,
      ...options
    })

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
 * Convert markdown to PDF with common academic settings
 */
export async function convertToPDF(
  inputPath: string,
  outputPath?: string,
  options: Partial<PandocOptions> = DEFAULT_OPTIONS
): Promise<ConversionResult> {
  const defaultOptions: PandocOptions = {
    ...DEFAULT_OPTIONS,
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
  const defaultOptions: PandocOptions = {
    ...DEFAULT_OPTIONS,
    outputFormat: 'html',
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
  const defaultOptions: PandocOptions = {
    outputFormat: 'epub',
    ...options
  }

  return convertWithPandoc(inputPath, outputPath, defaultOptions)
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
      // Engine not found, ignore
    }
  }

  return available
}
