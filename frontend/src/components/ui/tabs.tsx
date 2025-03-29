import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

// Context to manage the active tab
interface TabsContextProps {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a TabsProvider');
  }
  return context;
}

// Main Tabs component
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [tabValue, setTabValue] = useState(defaultValue);
  
  const currentValue = value !== undefined ? value : tabValue;
  const handleValueChange = onValueChange || setTabValue;

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        onChange: handleValueChange,
      }}
    >
      <div
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Tab list component
interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-200 p-1  dark:bg-muted-800 dark:text-muted-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Tab trigger component
interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function TabsTrigger({
  value,
  disabled = false,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: selectedValue, onChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-background text-foreground dark:bg-primary dark:text-muted-100 shadow-sm'
          : 'hover:bg-muted-100 hover:text-foreground dark:hover:bg-primary dark:hover:text-muted-100',
        className
      )}
      onClick={() => onChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

// Tab content component
interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'bg-white dark:bg-muted-950 text-black dark:text-muted-100 p-4 rounded-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


// Export all components
export { TabsContext, useTabs };
