"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/global/ui/card";
import { Building2, AlertCircle, X } from "lucide-react";
import { Button } from "@/src/shared/components/global/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NoCompanyAlertProps {
  onDismiss?: () => void;
}

export function NoCompanyAlert({ onDismiss }: NoCompanyAlertProps) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Nenhuma empresa associada
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-amber-700 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-amber-800">
          Você não possui nenhuma empresa associada à sua conta. Para utilizar o sistema, 
          é necessário que um administrador associe pelo menos uma empresa ao seu usuário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/accesses")}
            className="border-amber-300 text-amber-900 hover:bg-amber-100"
          >
            Ver Acessos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

