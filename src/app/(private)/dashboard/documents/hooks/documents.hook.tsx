"use client";

import { useModal } from "@/src/shared/context/modal-context";
import { DocumentFormModal } from "../_components/document-form";
import { api } from "@/src/shared/context/trpc-context";

export function useDocumentsPage() {
  const { openModal } = useModal();

  // Buscar documentos do banco
  const { data: documentsData, isLoading, error, refetch } = api.document.list.useQuery({
    page: 1,
    pageSize: 50,
  });

  const documents = documentsData?.documents || [];

  const mappedDocuments = documents.map((doc) => ({
    id: doc.id,
    name: doc.template?.name || "Documento",
    templateName: doc.template?.name || "",
    documentTypeId: doc.template?.id || "",
    documentTypeName: doc.template?.name || "",
    orgaoId: doc.organization?.id || "",
    orgaoName: doc.organization?.shortName || "",
    companyName: doc.company?.name || "",
    establishmentName: doc.establishment?.name || "",
    responsibleName: doc.responsible?.name || "",
    responsibleEmail: doc.responsible?.email || undefined,
    status: doc.status,
    expirationDate: doc.expirationDate?.toISOString() || "",
    alertDate: doc.alertDate?.toISOString() || "",
    observations: doc.observations || undefined,
    customData: doc.customData,
    groupId: doc.group?.id || undefined,
    groupName: doc.group?.name || undefined,
    attachments: [],
    createdAt: doc.createdAt.toISOString(),
  }));

  const handleOpenNewDocument = () => {
    openModal(
      "create-document",
      DocumentFormModal,
      {
        onSuccess: () => {
          refetch();
        },
      },
      {
        className: "max-w-full lg:max-w-5xl",
      }
    );
  };

  return {
    documents: mappedDocuments,
    isLoading,
    error,
    refetch,
    handleOpenNewDocument,
  };
}

