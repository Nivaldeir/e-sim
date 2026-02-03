"use client";

import { useModal } from "@/src/shared/context/modal-context";
import { TemplateFormModal } from "../_components/template-form-modal";
import { api } from "@/src/shared/context/trpc-context";
import { useMemo, useCallback } from "react";
import { useDataTable } from "@/src/shared/hook/use-data-table";
import { createColumns } from "../_components/columns";

export function useDocumentTypesPage() {
  const { openModal } = useModal();

  // Buscar templates do banco
  const { data: templatesData, isLoading, refetch } = api.documentTemplate.list.useQuery({
    page: 1,
    pageSize: 100,
  });

  const deleteMutation = api.documentTemplate.delete.useMutation();

  const templates = templatesData?.templates || [];

  // Mapear para formato da tabela
  const tableData = useMemo(() => {
    return templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description || "-",
      fieldsCount: template.fields?.length || 0,
      isDefault: template.isDefault,
      documentsCount: template._count?.documents || 0,
      createdAt: template.createdAt,
    }));
  }, [templates]);

  const handleOpenNewTemplate = useCallback(() => {
    openModal(
      "create-template",
      TemplateFormModal,
      {
        onSuccess: () => {
          refetch();
        },
      },
      {
        size: "lg",
      }
    );
  }, [openModal, refetch]);

  const handleEditTemplate = useCallback((templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    openModal(
      `edit-template-${templateId}`,
      TemplateFormModal,
      {
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          isDefault: template.isDefault,
          fields: template.fields || [],
        },
        onSuccess: () => {
          refetch();
        },
      },
      {
        size: "lg",
      }
    );
  }, [openModal, templates, refetch]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;

    try {
      await deleteMutation.mutateAsync({ id: templateId });
      refetch();
    } catch (error) {
      console.error("Erro ao excluir template:", error);
      alert("Erro ao excluir template");
    }
  }, [deleteMutation, refetch]);

  const columns = useMemo(
    () => createColumns(handleEditTemplate, handleDeleteTemplate),
    [handleEditTemplate, handleDeleteTemplate]
  );

  const { table } = useDataTable({
    data: tableData,
    columns,
    pageCount: Math.ceil(tableData.length / 10),
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
    },
  });

  return {
    table,
    tableData,
    templates,
    isLoading,
    handleOpenNewTemplate,
    handleEditTemplate,
    handleDeleteTemplate,
  };
}

