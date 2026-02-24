"use client";

import { useMemo, useCallback } from "react";
import { useDataTable } from "@/src/shared/hook/use-data-table";
import { getSocialReasonColumns } from "../_components/columns";
import { useModal } from "@/src/shared/context/modal-context";
import { SocialReasonModal } from "../_components/social-reason-form";
import { api } from "@/src/shared/context/trpc-context";

export function useSocialReasonsPage() {
  const { openModal } = useModal();

  const { data, isLoading, error, refetch } = api.socialReason.list.useQuery({
    page: 1,
    pageSize: 50,
  });

  const socialReasons = data?.socialReasons || [];

  // Mapear para formato da tabela
  const tableData = useMemo(() => socialReasons.map((sr: any) => ({
    id: sr.id,
    name: sr.name,
    shortName: sr.shortName,
    status: sr.status === "ACTIVE" ? "active" : "inactive",
  })), [socialReasons]);

  const handleEditReason = useCallback((reason: (typeof tableData)[0]) => {
    const originalSr = socialReasons.find((s: any) => s.id === reason.id);
    if (!originalSr) return;

    openModal(
      `edit-social-reason-${reason.id}`,
      SocialReasonModal,
      {
        socialReason: {
          id: originalSr.id,
          name: originalSr.name,
          shortName: originalSr.shortName,
          status: originalSr.status,
        },
        onSuccess: () => {
          refetch();
        },
      },
      {
        size: "md",
      }
    );
  }, [openModal, socialReasons, refetch]);

  const columns = useMemo(() => getSocialReasonColumns(handleEditReason), [handleEditReason]);

  const { table } = useDataTable({
    data: tableData,
    columns,
    pageCount: data?.pagination?.totalPages || 1,
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  });

  const handleOpenNewReason = () => {
    openModal(
      "create-social-reason",
      SocialReasonModal,
      {
        onSuccess: () => {
          refetch();
        },
      },
      {
        size: "md",
      }
    );
  };

  return {
    reasons: tableData,
    table,
    isLoading,
    error,
    refetch,
    handleOpenNewReason,
    handleEditReason,
  };
}











