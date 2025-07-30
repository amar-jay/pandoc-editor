import { ThemeProvider } from './components/theme-provider'
import MarkdownEditor from './components/editor-v3'
import { WindowsTitlebar } from './components/window-controls-new'
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
          toggleShortcuts={() => editorStates.shortcuts.toggleShortcuts()}
          handleFileSelect={editorStates.handlers.loadFile}
        />
        <SidebarInset>
          <WindowsTitlebar isZenMode={editorStates.states.isFullscreen} />
          <MarkdownEditor editorStates={editorStates} />
        </SidebarInset>
      </ThemeProvider>
    </SidebarProvider>
  )
}

export default App
