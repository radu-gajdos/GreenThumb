  import { Check, ChevronsUpDown } from "lucide-react"
  import { cn } from "../../lib/utils"
  import { Button } from "./button"
  import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command"
  import { Popover, PopoverContent, PopoverTrigger } from "./popover"
  import { forwardRef, useState } from "react"
  import React from "react"

  interface SearchSelectProps {
    options: { label: string; value: number | null | string; }[];
    placeholder: string;
    value: number | null | string;
    onValueChange?: (value: number | null | string) => void;
    modal?: boolean;
  }

  const SearchSelect = forwardRef<HTMLButtonElement, SearchSelectProps>(({ 
    options, 
    placeholder, 
    value, 
    onValueChange, 
    modal = false 
  }, ref) => {
    const [open, setOpen] = useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen} modal={modal}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`dark:bg-muted-950 dark:border-muted-800 dark:text-muted-100 w-full h-10 justify-between ${value ? `text-gray-900` : `text-gray-500`}  font-normal ${open ? "border-primary" : ""}`}
          >
            {value !== null
              ? options.find((option) => option.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[1100]" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    className="cursor-pointer"
                    key={option.value?.toString()}
                    value={option.value?.toString() || ''}
                    onSelect={() => {
                      if (onValueChange) {
                        onValueChange(option.value);
                      }
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  });

  SearchSelect.displayName = "SearchSelect";

  export default SearchSelect;