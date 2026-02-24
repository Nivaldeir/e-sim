export type ExpirationStatus = "safe" | "warning" | "danger" | "expired";

export interface ExpirationStatusResult {
  status: ExpirationStatus;
  color: string;
  bgColor: string;
  borderColor: string;
  text: string;
  daysRemaining: number | null;
}

/**
 * Calcula o status de expiração de um documento baseado nas datas
 * @param expirationDate Data de expiração do documento
 * @param alertDate Data de aviso (opcional)
 * @param warningDays Número de dias antes da expiração para mostrar aviso amarelo (padrão: 30)
 * @param dangerDays Número de dias antes da expiração para mostrar aviso vermelho (padrão: 7)
 * @returns Status e cores correspondentes
 */
export function getExpirationStatus(
  expirationDate: Date | string | null | undefined,
  alertDate?: Date | string | null,
  warningDays: number = 30,
  dangerDays: number = 7
): ExpirationStatusResult {
  if (!expirationDate) {
    return {
      status: "safe",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      text: "Sem data de expiração",
      daysRemaining: null,
    };
  }

  const expiration = typeof expirationDate === "string" ? new Date(expirationDate) : expirationDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expirationDateOnly = new Date(expiration);
  expirationDateOnly.setHours(0, 0, 0, 0);

  const diffTime = expirationDateOnly.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Documento já expirado
  if (diffDays < 0) {
    return {
      status: "expired",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      text: `Expirado há ${Math.abs(diffDays)} dia${Math.abs(diffDays) !== 1 ? "s" : ""}`,
      daysRemaining: diffDays,
    };
  }

  // Dentro do período de perigo ou aviso = Em Andamento (amarelo; antes de vencer)
  if (diffDays <= dangerDays || diffDays <= warningDays) {
    return {
      status: diffDays <= dangerDays ? "danger" : "warning",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      text: `Expira em ${diffDays} dia${diffDays !== 1 ? "s" : ""}`,
      daysRemaining: diffDays,
    };
  }

  // Seguro (branco – ainda não avisado)
  return {
    status: "safe",
    color: "text-muted-foreground",
    bgColor: "bg-background",
    borderColor: "border-border",
    text: `Válido por mais ${diffDays} dia${diffDays !== 1 ? "s" : ""}`,
    daysRemaining: diffDays,
  };
}

