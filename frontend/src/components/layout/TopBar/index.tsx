import React from "react"
import { LanguageSelector } from "./LanguageSelector"
import { NotificationsMenu } from "./NotificationsMenu"
import { ThemeSwitcher } from "./ThemeSwicher"

export const TopBar = () => {
  return (
    <div className="border-b h-16">
      <div className="flex items-center px-4 gap-4 h-full">
        <div className="flex-1">
            <div className="max-w-xl">
            </div>
        </div>
        
        <div className="flex items-end gap-2 justify justify-end">
          <LanguageSelector />
          <ThemeSwitcher />
          {/* <NotificationsMenu /> */}
        </div>
      </div>
    </div>
  )
}