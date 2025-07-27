import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

export default function SaveFileAsDialog({ saveFileAs }: { saveFileAs: (path: string) => void }) {
  const [filePath, setFilePath] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!filePath.trim()) {
      setError('File path cannot be empty')
      return
    }

    setError('')
    setOpen(false)
    saveFileAs(filePath)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className=" hidden lg:block" title="Save AS (Ctrl+S)">
          <Save className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter File Path</DialogTitle>
          <DialogDescription>
            Paste the full path manually or use the picker below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <Input
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="/path/to/your/file.txt"
            className="flex-1"
          />
        </div>

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
