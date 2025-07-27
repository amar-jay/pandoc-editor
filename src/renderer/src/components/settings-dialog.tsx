import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Settings, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { EditorSettings } from '@renderer/lib/types'
import { Slider } from './ui/slider'
import { DialogClose } from '@radix-ui/react-dialog'

interface SettingsDialogProps {
  settings: EditorSettings
  recentFiles: string[]
  updateSettings: (settings: Partial<EditorSettings>) => void
  toggleSettingsDialog: () => void
}
export function SettingsDialog({
  settings,
  recentFiles,
  updateSettings,
  toggleSettingsDialog
}: SettingsDialogProps) {
  return (
    <Dialog open={settings.settingsDialog} onOpenChange={toggleSettingsDialog}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Settings">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="appearance">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: 'auto' | 'light' | 'dark') =>
                  updateSettings({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSettings({ fontSize: value })}
                min={10}
                max={24}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => updateSettings({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                  <SelectItem value="Fira Code">Fira Code</SelectItem>
                  <SelectItem value="Monaco">Monaco</SelectItem>
                  <SelectItem value="Consolas">Consolas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Line Height: {settings.lineHeight}</Label>
              <Slider
                value={[settings.lineHeight]}
                min={1}
                max={2}
                step={0.1}
                onValueChange={([value]) => updateSettings({ lineHeight: value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Show Line Numbers</Label>
              <Switch
                checked={settings.showLineNumbers}
                onCheckedChange={(checked) => updateSettings({ showLineNumbers: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Word Wrap</Label>
              <Switch
                checked={settings.wordWrap}
                onCheckedChange={(checked) => updateSettings({ wordWrap: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Auto Save</Label>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSettings({ autoSave: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Spell Check</Label>
              <Switch
                checked={settings.spellCheck}
                onCheckedChange={(checked) => updateSettings({ spellCheck: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Vim Key Bindings</Label>
              <Switch
                checked={settings.vim}
                onCheckedChange={(checked) => updateSettings({ vim: checked })}
              />
            </div>

            {settings.vim && (
              <>
                <span className="text-xs font-semibold text-accent-foreground/50 p-0 mt-0">
                  Vim Settings
                </span>
                <div className="flex items-center justify-between">
                  <Label>Cursor</Label>
                  <Select
                    value={settings.cursorStyle ? settings.cursorStyle : 'block'}
                    onValueChange={(value: string) =>
                      updateSettings({
                        cursorStyle: value as EditorSettings['cursorStyle']
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="underline">Underline</SelectItem>
                      <SelectItem value="thin">Thin</SelectItem>
                      <SelectItem value="fat">Fat</SelectItem>
                      <SelectItem value="blink">Blink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Recent Files</Label>
              <div className="space-y-1">
                {recentFiles.map((file, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {file}
                  </div>
                ))}
                {recentFiles.length === 0 && (
                  <div className="text-sm text-muted-foreground">No recent files</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
