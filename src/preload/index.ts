import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { AlertTypes, ConversionResult, PandocOptions } from './types'

// Custom APIs for renderer
const api = {
  findMarkdownFiles: (dirPath?: string) => ipcRenderer.invoke('find-markdown-files', dirPath),
  readFileByPath: (filePath: string) => ipcRenderer.invoke('read-file-by-path', filePath),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('save-file', filePath, content),
  getFileTree: (dirPath?: string) => ipcRenderer.invoke('get-file-tree', dirPath),
  fetchMarkdownFile: (filePath: string) => ipcRenderer.invoke('fetch-markdown-file', filePath),
  updateMarkdownFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('update-markdown-file', filePath, content),
  grayMatter: (content: string) => ipcRenderer.invoke('gray-matter', content),
  reverseGrayMatter: (content: string, frontmatter: Record<string, unknown>) =>
    ipcRenderer.invoke('reverse-gray-matter', content, frontmatter),
  showAlert: (message: string, type: AlertTypes = 'info') =>
    ipcRenderer.invoke('show-alert', message, type),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  getDefaultPath: () => ipcRenderer.invoke('get-default-path')
} satisfies Window['api']

const pandoc = {
  async convert(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return ipcRenderer.invoke('pandoc-convert', inputPath, outputPath, options)
  },
  async toPDF(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return ipcRenderer.invoke('pandoc-to-pdf', inputPath, outputPath, options)
  },

  async toHTML(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return ipcRenderer.invoke('pandoc-to-html', inputPath, outputPath, options)
  },

  async toLaTeX(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return ipcRenderer.invoke('pandoc-to-latex', inputPath, outputPath, options)
  },

  async toDOCX(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return ipcRenderer.invoke('pandoc-to-docx', inputPath, outputPath, options)
  },

  async toEPUB(
    inputPath: string,
    outputPath?: string,
    options?: Partial<PandocOptions>
  ): Promise<ConversionResult> {
    return ipcRenderer.invoke('pandoc-to-epub', inputPath, outputPath, options)
  }
} satisfies Window['pandoc']

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('pandoc', pandoc)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.pandoc = pandoc
}
