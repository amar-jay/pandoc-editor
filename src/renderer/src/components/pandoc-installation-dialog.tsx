import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface PandocInstallationDialogProps {
  onInstallationComplete?: () => void
}

export function PandocInstallationDialog({
  onInstallationComplete
}: PandocInstallationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installationError, setInstallationError] = useState<string | null>(null)
  const [isPandocInstalled, setIsPandocInstalled] = useState<boolean | null>(null)

  // Check if Pandoc is installed on component mount
  useEffect(() => {
    checkPandocInstallation()
  }, [])

  const checkPandocInstallation = async () => {
    try {
      const result = await window.api.checkPandocInstalled()
      if (result.success) {
        setIsPandocInstalled(result.installed ?? false)
        if (!result.installed) {
          setIsOpen(true)
        }
      } else {
        console.error('Failed to check Pandoc installation:', result.error)
        setIsPandocInstalled(false)
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Error checking Pandoc installation:', error)
      setIsPandocInstalled(false)
      setIsOpen(true)
    }
  }

  const handleInstallPandoc = async () => {
    setIsInstalling(true)
    setInstallationError(null)

    try {
      const result = await window.api.installPandoc()

      if (result.success) {
        setIsPandocInstalled(true)
        setIsOpen(false)
        onInstallationComplete?.()
      } else {
        setInstallationError(result.error || 'Installation failed')
      }
    } catch (error) {
      setInstallationError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsInstalling(false)
    }
  }

  const handleSkip = () => {
    setIsOpen(false)
    // Note: This allows the app to continue without Pandoc, but export features will be disabled
  }

  const handleRetry = () => {
    setInstallationError(null)
    handleInstallPandoc()
  }

  // Don't render anything if we're still checking
  if (isPandocInstalled === null) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Pandoc Installation Required</DialogTitle>
          <DialogDescription>
            Pandoc is required for document conversion features (PDF, DOCX, etc.). Its installing
            now. Please wait
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isInstalling && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="text-sm text-muted-foreground">Installing Pandoc...</div>
              </div>
              <div className="text-xs text-muted-foreground">
                This may take a 5-15 minutes depending on your internet connection.
              </div>
            </div>
          )}

          {installationError && (
            <div className="space-y-3">
              <div className="text-sm text-destructive">
                Installation failed: {installationError}
              </div>
              <div className="text-xs text-muted-foreground">
                Please check your internet connection and try again. You can also skip this step and
                install Pandoc manually later.
              </div>
            </div>
          )}

          {!isInstalling && (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
              {installationError ? (
                <Button onClick={handleRetry}>Retry Installation</Button>
              ) : (
                <Button onClick={handleInstallPandoc}>Install Pandoc</Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
