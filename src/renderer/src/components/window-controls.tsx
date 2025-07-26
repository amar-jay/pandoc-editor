import { useState } from 'react'
import { Minus, Square, X, Folder } from 'lucide-react'

export const WindowsTitlebar = () => {
  return (
    <div className="w-full">
      {/* Titlebar */}
      <div className="flex items-center h-8 bg-white border-b border-gray-200 select-none">
        {/* App Icon and Title */}
        <div className="flex items-center px-2 flex-1">
          <Folder className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-sm text-gray-800 font-normal">My Application</span>
        </div>
      </div>
    </div>
  )
}
