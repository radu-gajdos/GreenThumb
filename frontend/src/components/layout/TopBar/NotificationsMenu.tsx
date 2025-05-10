import React from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export const NotificationsMenu = () => {
  const unreadCount = 3 // This will come from your state management

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative px-3 py-0">
          <Bell className="h-6" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 p-0 w-[18px] h-[18px] flex items-center justify-center bg-red-500 rounded-full"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuItem className="bg-slate-50">
          <div className="flex flex-col">
            <span className="font-semibold">New Client Added</span>
            <span className="text-sm text-slate-500">John Doe was added as a client</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex flex-col">
            <span>Invoice Paid</span>
            <span className="text-sm text-slate-500">Invoice #123 was paid</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}