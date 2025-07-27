import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  findMarkdownFiles: (dirPath?: string) => ipcRenderer.invoke('find-markdown-files', dirPath),
  readFileByPath: (filePath: string) => ipcRenderer.invoke('read-file-by-path', filePath),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('save-file', filePath, content),
  getFileTree: (dirPath?: string) => ipcRenderer.invoke('get-file-tree', dirPath),
  fetchMarkdownFile: (filePath: string) => ipcRenderer.invoke('fetch-markdown-file', filePath),
  updateMarkdownFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('update-markdown-file', filePath, content)
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
