import { useState } from 'react'
import { LucideIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { ColDefType } from '../interfaces/ColDefType'
import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'

interface SelectColumnDropdownProps {
  trigger: React.ReactNode
  columns: ColDefType[]
  onItemSelect: (field: string) => void
  icon?: LucideIcon
  title?: string
  searchPlaceholder?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const SelectColumnDropdown = ({
  trigger,
  columns,
  onItemSelect,
  icon: HeaderIcon,
  title = "Select a column",
  searchPlaceholder = "Search column...",
  isOpen,
  onOpenChange
}: SelectColumnDropdownProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open)
    if (!open) {
      setSearchTerm('')
    }
  }

  const filteredColumns = columns
    .filter(col => col.headerName)
    .filter(col => 
      col.headerName!.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-72 px-0 dark:bg-gray-900 dark:text-gray-200" align="start">
        <ScrollArea className="h-96">
          {/* Header */}
          <div className="flex items-center font-semibold text-xs px-2 pt-1 dark:text-gray-200">
            {HeaderIcon && <HeaderIcon className="w-4" />}
            <span className="pl-3">{title}</span>
          </div>

          <Separator className="mt-2 mb-1 dark:bg-gray-700" />

          {/* Search Input */}
          <input
            type="text"
            className="w-full bg-transparent focus:outline-none border-none focus:ring-0 text-xs px-3 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-400"
            placeholder={searchPlaceholder}
            autoFocus={true}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Separator className="my-2 dark:bg-gray-700" />

          {/* Items List */}
          <div className="px-1">
            {filteredColumns.map(col => (
              <DropdownMenuLabel
                key={col.colId ? col.colId : col.field}
                className="py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 font-medium cursor-pointer dark:text-gray-200"
                onClick={() => {
                  onItemSelect(col.colId ? col.colId : col.field!)
                  handleOpenChange(false)
                }}
              >
                <div className="flex items-center gap-2">
                  {col.icon && <col.icon className="h-4 w-4" />}
                  {col.headerName}
                </div>
              </DropdownMenuLabel>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
