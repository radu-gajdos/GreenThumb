import React from "react"
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandShortcut } from "@/components/ui/command"
import { CommandEmpty, CommandSeparator } from "cmdk"
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from "lucide-react"
import { useState } from "react"

export const CommandMenu = () => {
  const [showContent, setShowContent] = useState(false);
  
  return (
    <div className="relative">
      <Command className="border dark:border-gray-600 dark:bg-gray-900">
        <CommandInput placeholder="Type a command or search..." onFocus={() => setShowContent(true)} onBlur={() => setShowContent(false)} />
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <CommandList className={`bg-white rounded border dark:border-gray-600 dark:bg-gray-900 ${showContent ? "block" : "hidden"}`}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <Smile />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem disabled>
                <Calculator />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <User />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <CreditCard />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>
      </Command>
    </div>
  )
}