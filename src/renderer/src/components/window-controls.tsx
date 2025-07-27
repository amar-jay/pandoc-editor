import { Folder } from 'lucide-react'

export const WindowsTitlebar = () => {
  return (
    <div className="w-full bg-white dark:bg-black">
      {/* Titlebar */}
      <div className="flex items-center h-8 border-b select-none">
        {/* App Icon and Title */}
        <div className="flex items-center px-2 flex-1">
          <Folder className="w-4 h-4 text-blue-600 dark:text-blue-300 mr-2" />
          <span className="text-sm text-black dark:text-white font-normal">Pandoc Editor</span>
        </div>
      </div>
    </div>
  )
}
