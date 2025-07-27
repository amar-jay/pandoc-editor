import { ThemeProvider } from './components/theme-provider'
import MarkdownEditor from './components/editor-v3'
import { WindowsTitlebar } from './components/window-controls'
import { AppSidebar } from './components/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useEditorHook } from './components/hooks/editor-hook'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const editorStates = useEditorHook()

  return (
    <SidebarProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AppSidebar
          toggleSettingsDialog={() => editorStates.handlers.toggleSettingsDialog()}
          handleFileSelect={editorStates.handlers.loadFile}
        />
        <SidebarInset>
          <WindowsTitlebar />
          <MarkdownEditor editorStates={editorStates} />
        </SidebarInset>
      </ThemeProvider>
    </SidebarProvider>
  )
}

export default App
