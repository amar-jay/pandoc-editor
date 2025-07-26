import React, { useState, useRef, useCallback } from 'react'
import { GripVertical } from 'lucide-react'

interface ResizableSplitWindowProps {
  leftPanel: React.ReactNode
  rightPanel: React.ReactNode
  initialLeftWidth?: number // Initial width of the left panel in percentage
}
function ResizableSplitWindow({
  leftPanel,
  rightPanel,
  initialLeftWidth = 50
}: ResizableSplitWindowProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e) => {
    setIsResizing(true)
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const mouseX = e.clientX - containerRect.left
      const newLeftWidth = (mouseX / containerWidth) * 100

      // Constrain the width between 10% and 90%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 10), 90)
      setLeftWidth(constrainedWidth)
    },
    [isResizing]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add event listeners to document when resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full"
      style={{ cursor: isResizing ? 'col-resize' : 'default' }}
    >
      {/* Left Panel */}
      <div className="overflow-hidden" style={{ width: `${leftWidth}%` }}>
        {leftPanel}
      </div>

      {/* Resizer */}
      <div
        className="w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize flex items-center justify-center transition-colors duration-150 relative group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -inset-x-2 flex items-center justify-center">
          <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-150" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="overflow-hidden" style={{ width: `${100 - leftWidth}%` }}>
        {rightPanel}
      </div>
    </div>
  )
}

// Example usage
export default function App() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <ResizableSplitWindow
        leftPanel={
          <div className="p-4 h-full overflow-auto bg-white border-r border-gray-200">
            <p className="text-gray-600 mb-4">Left Panel Content</p>
            <div className="space-y-2">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded border">
                  <div className="font-medium">Item {i + 1}</div>
                  <div className="text-sm text-gray-500">Sample content</div>
                </div>
              ))}
            </div>
          </div>
        }
        rightPanel={
          <div className="p-4 h-full overflow-auto bg-white">
            <p className="text-gray-600 mb-4">Right Panel Content</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800">Card {i + 1}</div>
                  <div className="text-sm text-blue-600 mt-1">Content adapts to width</div>
                </div>
              ))}
            </div>
          </div>
        }
        initialLeftWidth={40}
      />
    </div>
  )
}
