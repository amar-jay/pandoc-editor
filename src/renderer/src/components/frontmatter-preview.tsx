import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Settings, Pencil, Plus, Save, X } from 'lucide-react'

interface FrontmatterPreviewProps {
  frontmatter: Record<string, unknown> | null
  showFrontmatter: boolean
  setShowFrontmatter: (value: boolean) => void
  isEditingFrontmatter: boolean
  editingFrontmatter: [string, string][]
  startEditingFrontmatter: () => void
  addFrontmatterField: () => void
  saveFrontmatter: () => Promise<void>
  cancelEditingFrontmatter: () => void
  updateFrontmatterKey: (index: number, newKey: string) => void
  updateFrontmatterValue: (index: number, value: string) => void
}

export function FrontmatterPreview({
  frontmatter,
  showFrontmatter,
  setShowFrontmatter,
  isEditingFrontmatter,
  editingFrontmatter,
  startEditingFrontmatter,
  addFrontmatterField,
  saveFrontmatter,
  cancelEditingFrontmatter,
  updateFrontmatterKey,
  updateFrontmatterValue
}: FrontmatterPreviewProps) {
  if (!showFrontmatter && !isEditingFrontmatter) return null
  if (!frontmatter && !isEditingFrontmatter) return null

  return (
    <Collapsible open={showFrontmatter} onOpenChange={setShowFrontmatter}>
      <CollapsibleContent className="bg-muted/20">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Settings className="w-3 h-3" />
              Frontmatter
            </div>
            <div className="flex items-center gap-1">
              {isEditingFrontmatter ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={addFrontmatterField}
                    className="h-6 w-6 p-0"
                    title="Add field"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={saveFrontmatter}
                    className="h-6 w-6 p-0"
                    title="Save frontmatter"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditingFrontmatter}
                    className="h-6 w-6 p-0"
                    title="Cancel editing"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditingFrontmatter}
                  className="h-6 w-6 p-0"
                  title="Edit frontmatter"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {isEditingFrontmatter ? (
            <div className="space-y-2">
              {editingFrontmatter.map(([key, value], index) => (
                <div key={`frontmatter-field-${index}`} className="flex items-center gap-2">
                  <input
                    className="font-mono text-xs text-primary min-w-fit focus-visible:ring-1"
                    value={key}
                    onChange={(e) => updateFrontmatterKey(index, e.target.value)}
                  />
                  <input
                    value={value}
                    onChange={(e) => updateFrontmatterValue(index, e.target.value)}
                    className="font-mono h-6 flex-1 text-xs border-0 bg-accent/50 pl-2 rounded-sm focus-visible:ring-1"
                    placeholder="Enter value"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {frontmatter &&
                Object.entries(frontmatter as Record<string, unknown>).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="font-mono text-xs text-primary min-w-fit">{key}:</span>
                    <span className="text-muted-foreground text-xs flex-1 break-words">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
