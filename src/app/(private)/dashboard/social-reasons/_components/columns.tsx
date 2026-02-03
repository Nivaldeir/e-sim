"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/global/ui";
import { DataTableColumnHeader } from "@/src/shared/components/global/datatable/data-table-column-header";
import type { SocialReason } from "./mock-data";

export const socialReasonColumns: ColumnDef<SocialReason>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Razão social" />
    ),
    cell: ({ row }) => {
      const reason = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{reason.name}</span>
          <span className="text-xs text-muted-foreground uppercase">
            {reason.shortName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
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




















