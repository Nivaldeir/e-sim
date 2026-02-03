"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/global/ui";
import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";

type OrganizationType = "FEDERAL" | "ESTADUAL" | "MUNICIPAL" | "OUTROS";

type OrgaoTableData = {
  id: string;
  name: string;
  shortName: string;
  type: OrganizationType;
  city: string;
  state: string;
  status: string;
  documentsCount: number;
};

export const orgaoColumns: ColumnDef<OrgaoTableData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Órgão" className="justify-start flex text-start w-full" />
    ),
    cell: ({ row }) => {
      const orgao = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{orgao.name}</span>
          <span className="text-xs text-muted-foreground uppercase">
            {orgao.shortName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" className="justify-start flex text-start w-full" />
    ),
    cell: ({ row }) => <span className="text-sm">{row.original.type}</span>,
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Município" className="justify-start flex text-start w-full" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.city}</span>
    ),
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UF" className="justify-start flex text-start w-full" />
    ),
    cell: ({ row }) => <span className="text-sm text-center flex justify-start">{row.original.state}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" className="justify-start flex text-start w-full" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const isActive = status === "active";
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={
            isActive
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-red-500 hover:bg-red-600 text-white"
          }
        >
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
];























