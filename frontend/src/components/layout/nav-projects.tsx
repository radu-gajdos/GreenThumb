import React from "react"
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavLink } from "react-router-dom"
import { useState } from "react"

export function NavProjects({
    projects,
}: {
    projects: {
        name: string
        url?: string
        icon: LucideIcon
        items?: {
            name: string
            url: string
        }[]
    }[]
}) {
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({
        "Potentiali Clienti": true // Open by default
    });

    const toggleItem = (name: string) => {
        setOpenItems(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden p-4">
            <SidebarMenu>
                {projects.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        {item.items ? (
                            <Collapsible open={openItems[item.name]} onOpenChange={() => toggleItem(item.name)}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="w-full">
                                        <item.icon />
                                        <span className="flex-1">{item.name}</span>
                                        {openItems[item.name] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="pl-6 pt-1">
                                        {item.items.map((subItem) => (
                                            <SidebarMenuItem key={subItem.name}>
                                                <SidebarMenuButton className="p-0">
                                                    <NavLink
                                                        to={subItem.url}
                                                        className={({ isActive }) => `peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm active ${isActive ? 'bg-muted-50 dark:bg-gray-600' : ''}`}
                                                    >
                                                        <span>{subItem.name}</span>
                                                    </NavLink>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ) : (
                            <SidebarMenuButton className="p-0">
                                <NavLink
                                    to={item.url!}
                                    className={({ isActive }) => `peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm active ${isActive ? 'bg-muted-50 dark:bg-gray-600' : ''}`}
                                >
                                    <item.icon />
                                    <span>{item.name}</span>
                                </NavLink>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
