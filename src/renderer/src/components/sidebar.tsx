'use client'

import * as React from 'react'
import { Folder, Moon, Search, Settings, Sun } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar'
import { FileTree } from './file-tree'
import type { TreeNode } from '@/types'
import { useTheme } from './hooks/use-theme'

function searchFileTree(tree: TreeNode[], query: string) {
  return tree.filter((node) => node.name.toLowerCase().includes(query.toLowerCase()))
}
export function AppSidebar({
  handleFileSelect,
  toggleSettingsDialog
}: {
  toggleSettingsDialog: () => void
  handleFileSelect: (path: string) => void
}) {
  const [selectedFile, setSelectedFile] = React.useState<string>()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [fileTreeData, setFileTreeData] = React.useState<TreeNode[]>([])
  const themeProvider = useTheme()

  const toggleTheme = () => {
    themeProvider.setTheme(themeProvider.theme === 'light' ? 'dark' : 'light')
  }

  React.useEffect(() => {
    const fileTree = window.api.getFileTree()

    fileTree
      .then((data) => {
        if (data.error) throw new Error(data.error)
        if (!data.success) throw new Error('Failed to fetch file tree')
        if (!data.tree) throw new Error('File tree is empty')
        setFileTreeData(data.tree)
      })
      .catch((error) => {
        window.api.showAlert('Error fetching file tree:' + error.message, 'error')
      })
  }, [])

  const _handleFileSelect = (path: string) => {
    setSelectedFile(path)
    handleFileSelect(path)
    // In a real Electron app, you would emit an IPC event here
    console.log('Selected file:', path)
  }
  const handleFileSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() !== '') {
      setFileTreeData(searchFileTree(fileTreeData, query.trim()))
    } else {
      // Reset to original file tree if search query is empty
      window.api.getFileTree().then((data) => {
        if (data.tree) {
          setFileTreeData(data.tree)
        }
      })
    }
  }

  return (
    <Sidebar variant="sidebar" className="border-r" collapsible="icon">
      <SidebarHeader className="gap-3.5 border-b px-[6px] py-2">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Folder className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">Pandoc Editor</span>
            <span className="truncate text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </div>
        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="absolute top-2 h-4 w-4 ml-2 text-muted-foreground" />
          <SidebarInput
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => handleFileSearch(e.target.value)}
            className={'pl-8'}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Explorer</SidebarGroupLabel>
          <SidebarGroupContent>
            <FileTree
              data={fileTreeData}
              onFileSelect={_handleFileSelect}
              selectedFile={selectedFile}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key={'Toggle Theme'}>
                <SidebarMenuButton
                  onClick={toggleTheme}
                  tooltip={`Switch to ${themeProvider.theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  {themeProvider.theme === 'light' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span>Toggle Theme</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key={'Settings'}>
                <SidebarMenuButton
                  onClick={() => {
                    console.log('Toggle settings dialog')
                    toggleSettingsDialog()
                  }}
                  tooltip="Open Settings"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Session not setup. No authentication for now
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
