'use client'

import * as React from 'react'
import { Search, Settings, Terminal, Zap } from 'lucide-react'
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
import { TreeNode } from '@renderer/lib/types'

// // Sample file tree data
// const fileTreeData = [
//   {
//     name: 'src',
//     type: 'folder' as const,
//     path: '/src',
//     children: [
//       {
//         name: 'components',
//         type: 'folder' as const,
//         path: '/src/components',
//         children: [
//           { name: 'App.tsx', type: 'file' as const, path: '/src/components/App.tsx' },
//           { name: 'Header.tsx', type: 'file' as const, path: '/src/components/Header.tsx' },
//           { name: 'Sidebar.tsx', type: 'file' as const, path: '/src/components/Sidebar.tsx' }
//         ]
//       },
//       {
//         name: 'utils',
//         type: 'folder' as const,
//         path: '/src/utils',
//         children: [
//           { name: 'helpers.ts', type: 'file' as const, path: '/src/utils/helpers.ts' },
//           { name: 'constants.ts', type: 'file' as const, path: '/src/utils/constants.ts' }
//         ]
//       },
//       { name: 'main.ts', type: 'file' as const, path: '/src/main.ts' },
//       { name: 'preload.ts', type: 'file' as const, path: '/src/preload.ts' },
//       { name: 'renderer.ts', type: 'file' as const, path: '/src/renderer.ts' }
//     ]
//   },
//   {
//     name: 'public',
//     type: 'folder' as const,
//     path: '/public',
//     children: [
//       { name: 'index.html', type: 'file' as const, path: '/public/index.html' },
//       { name: 'icon.png', type: 'file' as const, path: '/public/icon.png' }
//     ]
//   },
//   {
//     name: 'dist',
//     type: 'folder' as const,
//     path: '/dist',
//     children: [
//       { name: 'main.js', type: 'file' as const, path: '/dist/main.js' },
//       { name: 'renderer.js', type: 'file' as const, path: '/dist/renderer.js' }
//     ]
//   },
//   { name: 'package.json', type: 'file' as const, path: '/package.json' },
//   { name: 'tsconfig.json', type: 'file' as const, path: '/tsconfig.json' },
//   { name: 'electron-builder.json', type: 'file' as const, path: '/electron-builder.json' },
//   { name: 'README.md', type: 'file' as const, path: '/README.md' }
// ]

const navigationItems = [
  { title: 'Terminal', icon: Terminal, url: '#' },
  { title: 'Settings', icon: Settings, url: '#' }
]

export function AppSidebar() {
  const [selectedFile, setSelectedFile] = React.useState<string>()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [fileTreeData, setFileTreeData] = React.useState<TreeNode[]>([])

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
        alert('Error fetching file tree:' + error.message)
      })
  }, [])

  const handleFileSelect = (path: string) => {
    setSelectedFile(path)
    // In a real Electron app, you would emit an IPC event here
    console.log('Selected file:', path)
  }

  return (
    <Sidebar variant="inset" className="border-r">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Electron App</span>
            <span className="truncate text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <SidebarInput
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Explorer</SidebarGroupLabel>
          <SidebarGroupContent>
            <FileTree
              data={fileTreeData}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="font-medium">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">Ready • No issues found</div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
