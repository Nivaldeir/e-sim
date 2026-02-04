"use client";

import { QRCodeViewer } from "@/src/shared/components/global/qr-code-viewer";

interface GroupQRCodeViewerProps {
  groupId: string;
  groupName: string;
}

export function GroupQRCodeViewer({ groupId, groupName }: GroupQRCodeViewerProps) {
  const groupUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/document/group/${groupId}`;

  return (
    <QRCodeViewer
      url={groupUrl}
      fileName={`Grupo - ${groupName}`}
    />
  );
}








