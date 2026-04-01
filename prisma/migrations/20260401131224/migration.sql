-- CreateTable
CREATE TABLE "_DocumentGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DocumentGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DocumentGroups_B_index" ON "_DocumentGroups"("B");

-- AddForeignKey
ALTER TABLE "_DocumentGroups" ADD CONSTRAINT "_DocumentGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentGroups" ADD CONSTRAINT "_DocumentGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "document_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
