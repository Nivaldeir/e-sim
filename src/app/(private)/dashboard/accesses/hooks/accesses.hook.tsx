"use client";

import { useMemo, useCallback } from "react";
import { useDataTable } from "@/src/shared/hook/use-data-table";
import { getAccessColumns } from "../_components/columns";
import { useModal } from "@/src/shared/context/modal-context";
import { AccessModal } from "../_components/access-modal";
import { AccessFormModal } from "../_components/access-form";
import { api } from "@/src/shared/context/trpc-context";

export function useAccessesPage() {
  const { openModal } = useModal();

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
    
    return users.map((user) => ({
      id: user.id,
      name: user.name || "Sem nome",
      email: user.email || "",
      roles: user.roles,
      companies: user.companies,
    }));
  }, [users]);

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
    const user = users?.find((u) => u.id === userId);
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
    const user = users?.find((u) => u.id === userId);
    if (user && user.roles.length > 0) {
      // Remove todas as roles do usuário
      user.roles.forEach((role) => {
        removeRoleMutation.mutate({
          userId,
          roleId: role.id,
        });
      });
    }
  }, [users, removeRoleMutation]);

  const columns = useMemo(() => getAccessColumns(handleEditAccess, handleDeleteAccess), [handleEditAccess, handleDeleteAccess]);

  const { table } = useDataTable({
    data: tableData,
    columns,
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
    handleOpenNewAccess,
    handleEditAccess,
    handleDeleteAccess,
  };
}










