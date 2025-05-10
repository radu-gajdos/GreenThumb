import React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Timer } from "lucide-react"

export const QuickActions = () => {

  return (
    <div className="pl-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" className="flex items-center gap-2 pl-3 pr-1">
            <Timer className="h-4 w-4" />
            Acțiuni rapide
            <div className="border-l border-muted-300 h-full items-center px-2">
              <ChevronDown className="w-4 !h-full" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="min-w-44">
          <DropdownMenuItem className="cursor-pointer">Add plot</DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">Ai chat</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}