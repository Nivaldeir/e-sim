"use client";

import { useMemo, useCallback, useState } from "react";
import { useDataTable } from "@/src/shared/hook/use-data-table";
import { getAccessColumns } from "../_components/columns";
import { useModal } from "@/src/shared/context/modal-context";
import { AccessModal } from "../_components/access-modal";
import { AccessFormModal } from "../_components/access-form";
import { api } from "@/src/shared/context/trpc-context";
import { ColumnDef } from "@tanstack/react-table";

export function useAccessesPage() {
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading, error, refetch } = api.access.listUsers.useQuery();
  const { data: roles } = api.access.listRoles.useQuery();
  
  const removeRoleMutation = api.access.removeRole.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Mapear dados para formato da tabela
  const tableData = useMemo(() => {
    if (!users) return [];
    
    return users.map((user: any) => ({
      id: user.id,
      name: user.name || "Sem nome",
      email: user.email || "",
      roles: user.roles,
      companies: user.companies,
    }));
  }, [users]);

  // Filtrar por pesquisa (nome ou e-mail)
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return tableData;
    const q = searchQuery.trim().toLowerCase();
    return tableData.filter(
      (row: { name: string; email: string }) =>
        (row.name || "").toLowerCase().includes(q) ||
        (row.email || "").toLowerCase().includes(q)
    );
  }, [tableData, searchQuery]);

  const handleOpenNewAccess = useCallback(() => {
    openModal(
      "create-access",
      AccessFormModal,
      {
        roles: roles || [],
        onSuccess: () => {
          refetch();
        },
      },
      {
        size: "md",
      }
    );
  }, [openModal, roles, refetch]);

  const handleEditAccess = useCallback((userId: string) => {
    const user = users?.find((u: any) => u.id === userId);
    if (!user) return;

    openModal(
      `edit-access-${userId}`,
      AccessModal,
      {
        user: {
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          roles: user.roles,
          companies: user.companies,
        },
        roles: roles || [],
        onSuccess: () => {
          refetch();
        },
      },
      {
        size: "lg",
      }
    );
  }, [openModal, users, roles, refetch]);

  const handleDeleteAccess = useCallback((userId: string) => {
    const user = users?.find((u: any) => u.id === userId);
    if (user && user.roles.length > 0) {
      // Remove todas as roles do usuário
      user.roles.forEach((role: any) => {
        removeRoleMutation.mutate({
          userId,
          roleId: role.id,
        });
      });
    }
  }, [users, removeRoleMutation]);

  const columns = useMemo(() => getAccessColumns(handleEditAccess, handleDeleteAccess), [handleEditAccess, handleDeleteAccess]);

  const { table } = useDataTable({
    data: filteredData,
    columns: columns as ColumnDef<{ id: any; name: any; email: any; roles: any; companies: any; }, any>[],
    pageCount: 1,
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  });

  return {
    accesses: tableData,
    users,
    roles,
    table,
    isLoading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    handleOpenNewAccess,
    handleEditAccess,
    handleDeleteAccess,
  };
}










