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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/src/shared/components/global/ui/dropdown-menu"
import { useModal } from "@/src/shared/context/modal-context"
import Link from "next/link"
import {
  LifeBuoy,
  FileText,
  CalendarDays,
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
import { api } from "../../context/trpc-context"
import { useSelectedCompany } from "@/src/shared/context/company-context"

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
      title: "Calendário de vencimentos",
      url: "/dashboard/documents/calendar",
      icon: CalendarDays,
    },
    {
      title: "Empresas",
      url: "/dashboard/companies",
      icon: Building2,
    },
    {
      title: "Razão Social",
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
  const { selectedCompany, setSelectedCompany } = useSelectedCompany();
  const { data: companiesData } = api.company.list.useQuery({
    page: 1,
    pageSize: 10,
  });
  const companies = companiesData?.companies ?? [];
  const displayName = selectedCompany?.name ?? companies[0]?.name ?? "Workspace";

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
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                      <span className="truncate text-xs font-medium text-foreground">{displayName}</span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {companies.length > 0 ? `${companies.length} empresa${companies.length !== 1 ? "s" : ""}` : "Empresas"}
                      </span>
                    </div>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-50 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Empresas</span>
                  <Button variant="outline" size="icon" className="w-6 h-6 rounded-sm cursor-pointer" asChild>
                    <Link href="/dashboard/companies">
                      <PlusIcon className="size-3.5" />
                    </Link>
                  </Button>
                </DropdownMenuLabel>
                {companies.length > 0 ? (
                  companies.slice(0, 8).map((company: { id: string; name: string }) => (
                    <DropdownMenuItem
                      key={company.id}
                      onClick={() => setSelectedCompany({ id: company.id, name: company.name })}
                      className="cursor-pointer"
                    >
                      {company.name}
                    </DropdownMenuItem>
                  ))
                ) : null}
                {companies.length > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/companies" className="cursor-pointer">
                      Ver todas as empresas
                    </Link>
                  </DropdownMenuItem>
                )}
                {companies.length === 0 && (
                  <DropdownMenuLabel className="font-normal text-muted-foreground">
                    Nenhuma empresa cadastrada
                  </DropdownMenuLabel>
                )}
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
