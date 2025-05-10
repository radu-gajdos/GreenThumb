import React from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { languages, useLanguage } from "@/contexts/LanguageContext"
import { US } from 'country-flag-icons/react/3x2'

export const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage()
  const CurrentFlag = languages.find(lang => lang.code === currentLanguage)?.flag || US
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3">
          <CurrentFlag className="w-4" />
          {/* <span>{currentLanguage.toUpperCase()}</span> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[180px]">
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code} 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => changeLanguage(lang.code)}
          >
            <lang.flag className="h-4 w-4 mr-1" />
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}