"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/shared/components/global/ui/dialog";
import { Button } from "@/src/shared/components/global/ui/button";
import { QrCode, Download } from "lucide-react";

interface QRCodeViewerProps {
  url: string;
  fileName?: string;
  trigger?: React.ReactNode;
}

export function QRCodeViewer({ url, fileName, trigger }: QRCodeViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = () => {
    const svg = document.querySelector("#qrcode-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName || "qrcode"}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            Ver QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code do Arquivo</DialogTitle>
          <DialogDescription>
            Escaneie este QR code para acessar o arquivo
            {fileName && `: ${fileName}`}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            <QRCodeSVG
              id="qrcode-svg"
              value={url}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-sm text-muted-foreground text-center break-all">
              {url}
            </p>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

