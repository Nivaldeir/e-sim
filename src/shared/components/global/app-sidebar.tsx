"use client"

import type React from "react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/src/shared/components/global/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/src/shared/components/global/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/shared/components/global/ui/dropdown-menu"
import { useModal } from "@/src/shared/context/modal-context"
import Link from "next/link"
import {
  LifeBuoy,
  FileText,
  Building2,
  Store,
  Landmark,
  IdCard,
  KeyRound,
  MessageCircle,
  ChevronsUpDown,
  LogOut,
  PlusIcon,
  LayoutDashboard,
  Settings,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "./ui/button"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Documentos",
      url: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: "Empresas",
      url: "/dashboard/companies",
      icon: Building2,
    },
    {
      title: "Razões Sociais",
      url: "/dashboard/social-reasons",
      icon: IdCard,
    },
    {
      title: "Estabelecimentos",
      url: "/dashboard/establishments",
      icon: Store,
    },
    {
      title: "Tipos de documentos",
      url: "/dashboard/document-types",
      icon: FileText,
    },
    {
      title: "Órgãos",
      url: "/dashboard/orgao",
      icon: Landmark,
    },
    {
      title: "Acessos",
      url: "/dashboard/accesses",
      icon: KeyRound,
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: MessageCircle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <Building2 className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-xs text-muted-foreground">Workspace</span>
                    </div>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Workspaces</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-4 h-4 rounded-sm cursor-pointer"
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col items-center">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#" onClick={() => signOut()}>
                <LogOut className="size-4" />
                <span>Sair</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
