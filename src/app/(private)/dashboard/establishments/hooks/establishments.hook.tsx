"use client";

import { useDataTable } from "@/src/shared/hook/use-data-table";
import { useModal } from "@/src/shared/context/modal-context";
import { EstablishmentModal } from "../_components/establishment-form";
import { establishmentColumns } from "../_components/columns";
import { api } from "@/src/shared/context/trpc-context";

export function useEstablishmentsPage() {
  const { openModal } = useModal();

  const { data, isLoading, error, refetch } = api.establishment.list.useQuery({
    page: 1,
    pageSize: 50,
  });

  const establishments = data?.establishments || [];

  // Mapear dados para formato da tabela
  const tableData = establishments.map((est) => ({
    id: est.id,
    name: est.name,
    code: est.code || "",
    address: `${est.city || ""}, ${est.state || ""}`.trim().replace(/^,\s*|,\s*$/g, "") || "-",
    status: est.status === "ACTIVE" ? "active" : "inactive",
    filesCount: est._count?.documents || 0,
    company: est.company?.name || "-",
  }));

  const { table } = useDataTable({
    data: tableData,
    columns: establishmentColumns,
    pageCount: data?.pagination?.totalPages || 1,
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  });

  const handleOpenNewEstablishment = () => {
    openModal(
      "create-establishment",
      EstablishmentModal,
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

  const handleEditEstablishment = (establishment: typeof tableData[0]) => {
    const originalEst = establishments.find((e) => e.id === establishment.id);
    if (!originalEst) return;

    openModal(
      `edit-establishment-${establishment.id}`,
      EstablishmentModal,
      {
        establishment: {
          id: originalEst.id,
          companyId: originalEst.company?.id || "",
          name: originalEst.name,
          code: originalEst.code || "",
          cnpj: originalEst.cnpj || "",
          stateRegistration: originalEst.stateRegistration || "",
          municipalRegistration: originalEst.municipalRegistration || "",
          address: originalEst.address || "",
          district: originalEst.district || "",
          city: originalEst.city || "",
          state: originalEst.state || "",
          zipCode: originalEst.zipCode || "",
          status: originalEst.status,
        },
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
    establishments: tableData,
    table,
    isLoading,
    error,
    refetch,
    handleOpenNewEstablishment,
    handleEditEstablishment,
  };
}


