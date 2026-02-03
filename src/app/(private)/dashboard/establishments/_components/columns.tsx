"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/global/ui";
import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";
import { FileText } from "lucide-react";

type EstablishmentTableData = {
  id: string;
  name: string;
  code: string;
  address: string;
  status: string;
  filesCount: number;
  company: string;
};

export const establishmentColumns: ColumnDef<EstablishmentTableData>[] = [
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
      const status = row.original.status;
      return (
        <div className="flex justify-center">
          <Badge
            variant={status === "active" ? "default" : "secondary"}
            className={
              status === "active" ? "bg-emerald-500 hover:bg-emerald-600" : ""
            }
          >
            {status === "active" ? "Ativo" : "Inativo"}
          </Badge>
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















