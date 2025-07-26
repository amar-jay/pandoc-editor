import { ThemeProvider } from './components/theme-provider'
import MarkdownEditor from './components/editor-v3'
import { WindowsTitlebar } from './components/window-controls'
import { AppSidebar } from './components/sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <SidebarProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AppSidebar />
        <SidebarInset>
          <WindowsTitlebar />
          <MarkdownEditor />
        </SidebarInset>
      </ThemeProvider>
    </SidebarProvider>
  )
}

export default App
