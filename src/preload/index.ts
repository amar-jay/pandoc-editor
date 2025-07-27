import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AlertTypes } from '../main'

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
  showAlert: (message: string, type: AlertTypes) => ipcRenderer.invoke('show-alert', message, type),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
