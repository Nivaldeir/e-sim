"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge, Button } from "@/src/shared/components/global/ui";
import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";
import { FileText } from "lucide-react";

export type EstablishmentTableData = {
  id: string;
  name: string;
  code: string;
  address: string;
  status: string;
  filesCount: number;
  company: string;
};

export function getEstablishmentColumns(onEdit: (establishment: EstablishmentTableData) => void): ColumnDef<EstablishmentTableData>[] {
  return [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estabelecimento " className="justify-start flex text-start w-full" />
    ),
    cell: ({ row }) => {
      const establishment = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-medium">{establishment.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    ),
    cell: ({ row }) => {
      return <span className="text-sm text-center flex justify-center">{row.original.code}</span>;
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Endereço" />
    ),
    cell: ({ row }) => {
      return <span className="text-sm text-center flex justify-center">{row.original.address}</span>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const establishment = row.original;
      const status = establishment.status;
      const isActive = status === "active";
      return (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => onEdit(establishment)}
            title="Abrir para edição"
          >
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={
                isActive ? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer" : "cursor-pointer"
              }
            >
              {isActive ? "Ativo" : "Inativo"}
            </Badge>
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "filesCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Arquivos" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium text-center flex justify-center">
          {row.original.filesCount}
        </span>
      );
    },
  },
];
}











