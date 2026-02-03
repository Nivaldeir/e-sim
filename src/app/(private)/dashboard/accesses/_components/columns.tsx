"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/global/ui";
import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";
import { Button } from "@/src/shared/components/global/ui";
import { Edit, X } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  roles: Array<{
    id: string;
    name: string;
  }>;
  companies?: Array<{
    id: string;
    name: string;
    cnpj: string;
    code: string | null;
  }>;
};

export const getAccessColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<User>[] => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" className="justify-start flex text-start w-full" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{user.name || "Sem nome"}</span>
            <span className="text-xs text-muted-foreground">{user.email || ""}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "roles",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Níveis de acesso" className="justify-start flex text-start w-full" />
      ),
      cell: ({ row }) => {
        const roles = row.original.roles;
        if (!roles || roles.length === 0) {
          return (
            <Badge variant="outline" className="text-xs">
              Sem acesso
            </Badge>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge key={role.id} variant="secondary" className="text-xs">
                {role.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "companies",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Empresas" className="justify-start flex text-start w-full" />
      ),
      cell: ({ row }) => {
        const companies = row.original.companies;
        if (!companies || companies.length === 0) {
          return (
            <Badge variant="outline" className="text-xs text-center flex justify-center">
              Sem empresa
            </Badge>
          );
        }
        return (
          <div className="flex flex-col gap-1">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {company.name}
                </Badge>
                {company.code && (
                  <span className="text-xs text-muted-foreground">
                    ({company.code})
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(user.id)}
              className="h-8 w-8 p-0"
              title="Editar acessos"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Remover todos os acessos"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];










