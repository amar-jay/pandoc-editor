import { ThemeProvider } from './components/theme-provider'
import MarkdownEditor from './components/editor-v3'
import { WindowsTitlebar } from './components/window-controls'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <WindowsTitlebar />
      <MarkdownEditor />
    </ThemeProvider>
  )
}

export default App
