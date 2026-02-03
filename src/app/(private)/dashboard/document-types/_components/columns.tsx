"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/src/shared/components/global/ui/button";
import { Badge } from "@/src/shared/components/global/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";

type Template = {
  id: string;
  name: string;
  description: string;
  fieldsCount: number;
  isDefault: boolean;
  documentsCount: number;
  createdAt: Date;
};

export function createColumns(
  handleEditTemplate: (id: string) => void,
  handleDeleteTemplate: (id: string) => void
): ColumnDef<Template>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" className="justify-center flex text-start w-full" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-sm text-center flex justify-center">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Descrição" className="justify-center flex text-start w-full" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-center flex justify-center">{row.original.description}</span>
      ),
    },
    {
      accessorKey: "fieldsCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Campos" className="justify-center flex text-center w-full" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-center flex justify-center">{row.original.fieldsCount} campos</span>
      ),
    },
    {
      accessorKey: "isDefault",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Padrão" className="justify-center flex text-center w-full" />
      ),
      cell: ({ row }) =>
        row.original.isDefault ? (
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
              Padrão
            </Badge>
          </div>
        ) : (
          <span className="text-sm text-center flex justify-center text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: "documentsCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Documentos" className="justify-center flex text-center w-full" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-center flex justify-center">
          {row.original.documentsCount}
        </span>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ações" className="justify-center flex text-center w-full" />  
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditTemplate(row.original.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteTemplate(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}

