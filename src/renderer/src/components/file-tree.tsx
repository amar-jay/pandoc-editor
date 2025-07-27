'use client'

import * as React from 'react'
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface FileNode {
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  path: string
}

interface FileTreeProps {
  data: FileNode[]
  onFileSelect?: (path: string) => void
  selectedFile?: string
}

export function FileTree({ data, onFileSelect, selectedFile }: FileTreeProps) {
  return (
    <SidebarMenu>
      {data.map((item, index) => (
        <FileTreeItem
          key={`${item.path}-${index}`}
          item={item}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
        />
      ))}
    </SidebarMenu>
  )
}

interface FileTreeItemProps {
  item: FileNode
  onFileSelect?: (path: string) => void
  selectedFile?: string
  level?: number
}

function FileTreeItem({ item, onFileSelect, selectedFile, level = 0 }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isSelected = selectedFile === item.path
  const hasChildren = item.children && item.children.length > 0

  if (item.type === 'file') {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => onFileSelect?.(item.path)}
          className={cn(
            'h-7 text-sm font-normal',
            isSelected && 'bg-accent text-accent-foreground font-medium'
          )}
          style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
          tooltip={item.name}
        >
          <File className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="h-7 text-sm font-normal"
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            tooltip={item.name}
          >
            <ChevronRight
              className={cn('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-90')}
            />
            {isOpen ? (
              <FolderOpen className="h-4 w-4 shrink-0" />
            ) : (
              <Folder className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{item.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {hasChildren && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children!.map((child, index) => (
                <FileTreeItem
                  key={`${child.path}-${index}`}
                  item={child}
                  onFileSelect={onFileSelect}
                  selectedFile={selectedFile}
                  level={level + 1}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </Collapsible>
    </SidebarMenuItem>
  )
}
