import { ThemeProvider } from './components/theme-provider'
import MarkdownEditor from './components/editor-v3'
import { WindowsTitlebar } from './components/window-controls'
import { AppSidebar } from './components/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useCallback, useRef } from 'react'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const openFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <SidebarProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AppSidebar handleFileSelect={openFile} />
        <SidebarInset>
          <WindowsTitlebar />
          <MarkdownEditor fileInputRef={fileInputRef} />
        </SidebarInset>
      </ThemeProvider>
    </SidebarProvider>
  )
}

export default App
