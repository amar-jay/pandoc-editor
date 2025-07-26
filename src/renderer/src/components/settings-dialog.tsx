import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Settings } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { EditorSettings } from '@renderer/lib/types'
import { Slider } from './ui/slider'

interface SettingsDialogProps {
  settings: {
    settings: EditorSettings
    setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>
  }
  recentFiles: string[]
}
export function SettingsDialog({ settings, recentFiles }: SettingsDialogProps) {
  return (
    <Dialog>
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
                value={settings.settings.theme}
                onValueChange={(value: 'auto' | 'light' | 'dark') =>
                  settings.setSettings({ ...settings.settings, theme: value })
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
              <Label>Font Size: {settings.settings.fontSize}px</Label>
              <Slider
                value={[settings.settings.fontSize]}
                onValueChange={([value]) =>
                  settings.setSettings({ ...settings.settings, fontSize: value })
                }
                min={10}
                max={24}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={settings.settings.fontFamily}
                onValueChange={(value) =>
                  settings.setSettings({ ...settings.settings, fontFamily: value })
                }
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
              <Label>Line Height: {settings.settings.lineHeight}</Label>
              <Slider
                value={[settings.settings.lineHeight]}
                min={1}
                max={2}
                step={0.1}
                onValueChange={([value]) =>
                  settings.setSettings({ ...settings.settings, lineHeight: value })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Show Line Numbers</Label>
              <Switch
                checked={settings.settings.showLineNumbers}
                onCheckedChange={(checked) =>
                  settings.setSettings({ ...settings.settings, showLineNumbers: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Word Wrap</Label>
              <Switch
                checked={settings.settings.wordWrap}
                onCheckedChange={(checked) =>
                  settings.setSettings({ ...settings.settings, wordWrap: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Auto Save</Label>
              <Switch
                checked={settings.settings.autoSave}
                onCheckedChange={(checked) =>
                  settings.setSettings({ ...settings.settings, autoSave: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Spell Check</Label>
              <Switch
                checked={settings.settings.spellCheck}
                onCheckedChange={(checked) =>
                  settings.setSettings({ ...settings.settings, spellCheck: checked })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Vim Key Bindings</Label>
              <Switch
                checked={settings.settings.vim}
                onCheckedChange={(checked) =>
                  settings.setSettings({ ...settings.settings, vim: checked })
                }
              />
            </div>

            {settings.settings.vim && (
              <>
                <span className="text-xs font-semibold text-accent-foreground/50 p-0 mt-0">Vim Settings</span>
                <div className="flex items-center justify-between">
                  <Label>Cursor</Label>
                  <Select
                    value={settings.settings.cursorStyle ? settings.settings.cursorStyle : 'block'}
                    onValueChange={(value: EditorSettings['cursorStyle']) =>
                      settings.setSettings({ ...settings.settings, cursorStyle: value })
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
