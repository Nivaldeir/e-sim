-- AlterTable
ALTER TABLE "document_templates" ADD COLUMN     "classification" TEXT;

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "chief_id" TEXT,
ADD COLUMN     "classification" TEXT,
ADD COLUMN     "group_id" TEXT,
ADD COLUMN     "issue_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "document_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_groups_name_idx" ON "document_groups"("name");

-- CreateIndex
CREATE INDEX "document_templates_classification_idx" ON "document_templates"("classification");

-- CreateIndex
CREATE INDEX "documents_chief_id_idx" ON "documents"("chief_id");

-- CreateIndex
CREATE INDEX "documents_group_id_idx" ON "documents"("group_id");

-- CreateIndex
CREATE INDEX "documents_issue_date_idx" ON "documents"("issue_date");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_chief_id_fkey" FOREIGN KEY ("chief_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "document_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
