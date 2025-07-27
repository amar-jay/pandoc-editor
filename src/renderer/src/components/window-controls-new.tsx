import { Folder } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'

export const WindowsTitlebar = ({ isZenMode }: { isZenMode: boolean }) => {
  const [isMaximized, setIsMaximized] = useState(false)

  // Check if window is maximized on mount
  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electron?.ipcRenderer) {
        const maximized = await window.electron.ipcRenderer.invoke('window-is-maximized')
        setIsMaximized(maximized)
      }
    }
    checkMaximized()

    // Listen for window state changes
    if (window.electron?.ipcRenderer) {
      const unsubscribe = window.electron.ipcRenderer.on('window-maximized', () => {
        setIsMaximized(true)
      })
      const unsubscribe2 = window.electron.ipcRenderer.on('window-unmaximized', () => {
        setIsMaximized(false)
      })

      return () => {
        unsubscribe?.()
        unsubscribe2?.()
      }
    }
  }, [])

  const handleDoubleClick = () => {
    // maximize or unmaximize the window on double click
    if (window.electron?.ipcRenderer) {
      if (isMaximized) {
        window.electron.ipcRenderer.invoke('window-unmaximize')
      } else {
        window.electron.ipcRenderer.invoke('window-maximize')
      }
    }
  }

  return (
    <div className="w-full bg-white dark:bg-black">
      {/* Titlebar */}
      <div
        className="flex items-center h-8 border-b select-none"
        style={
          !isZenMode
            ? ({
                // Make the titlebar draggable
                WebkitAppRegion: 'drag'
              } as React.CSSProperties)
            : {}
        }
        onDoubleClick={handleDoubleClick}
      >
        {/* App Icon and Title */}
        <div className="flex items-center px-2 flex-1">
          <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="mr-2">
            <SidebarTrigger />
          </div>
          <Folder className="w-4 h-4 text-blue-600 dark:text-blue-300 mr-2" />
          <span className="text-sm text-black dark:text-white font-normal">Pandoc Editor</span>
        </div>
      </div>
    </div>
  )
}
