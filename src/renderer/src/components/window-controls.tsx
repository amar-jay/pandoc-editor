import { Folder } from 'lucide-react'

export const WindowsTitlebar = () => {
  return (
    <div className="w-full">
      {/* Titlebar */}
      <div className="flex items-center h-8 border-b select-none">
        {/* App Icon and Title */}
        <div className="flex items-center px-2 flex-1">
          <Folder className="w-4 h-4 text-blue-600 dark:text-blue-300 mr-2" />
          <span className="text-sm text-gray-800 dark:text-gray-200 font-normal">Pandoc Editor</span>
        </div>
      </div>
    </div>
  )
}
