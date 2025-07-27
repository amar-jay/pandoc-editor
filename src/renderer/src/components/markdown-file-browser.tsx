import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FileText, FolderOpen, Folder, Search } from 'lucide-react'

interface MarkdownFile {
  path: string
  name: string
}

interface MarkdownFileBrowserProps {
  onFileSelect?: (filePath: string) => void
}

export function MarkdownFileBrowser({ onFileSelect }: MarkdownFileBrowserProps) {
  const [files, setFiles] = useState<MarkdownFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchPath, setSearchPath] = useState('')
  const [filteredFiles, setFilteredFiles] = useState<MarkdownFile[]>([])
  const [nameFilter, setNameFilter] = useState('')

  const searchMarkdownFiles = async (dirPath?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await window.api.findMarkdownFiles(dirPath)

      if (result.success && result.files) {
        const markdownFiles: MarkdownFile[] = result.files.map((path) => ({
          path,
          name: path.split('/').pop() || path
        }))
        setFiles(markdownFiles)
        setFilteredFiles(markdownFiles)
      } else {
        setError(result.error || 'Failed to find markdown files')
      }
    } catch (err) {
      setError('Error occurred while searching for files')
      console.error('Error finding markdown files:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterFiles = (filter: string) => {
    setNameFilter(filter)
    if (filter.trim() === '') {
      setFilteredFiles(files)
    } else {
      const filtered = files.filter(
        (file) =>
          file.name.toLowerCase().includes(filter.toLowerCase()) ||
          file.path.toLowerCase().includes(filter.toLowerCase())
      )
      setFilteredFiles(filtered)
    }
  }

  const handleFileSelect = (filePath: string) => {
    if (onFileSelect) {
      onFileSelect(filePath)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <FolderOpen className="w-4 h-4 mr-2" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Browse Markdown Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Directory Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Directory path (leave empty for home directory)"
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => searchMarkdownFiles(searchPath.trim() || undefined)}
              disabled={isLoading}
            >
              <Folder className="w-4 h-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filter Files Input */}
          {files.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filter files..."
                value={nameFilter}
                onChange={(e) => filterFiles(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Files List */}
          <div className="max-h-96 overflow-y-auto scrollbar border rounded-md">
            {filteredFiles.length > 0 ? (
              <div className="space-y-1 p-2">
                {filteredFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer group"
                    onClick={() => handleFileSelect(file.path)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{file.path}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileSelect(file.path)
                      }}
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {isLoading ? (
                  <p>Searching for markdown files...</p>
                ) : files.length === 0 ? (
                  <p>No search performed yet. Click &ldquo;Search&rdquo; to find markdown files.</p>
                ) : (
                  <p>No files match your filter.</p>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          {files.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredFiles.length} of {files.length} markdown files
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
