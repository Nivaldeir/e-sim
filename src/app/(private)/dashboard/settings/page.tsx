"use client";

import { ThemeCustomizer } from "@/src/shared/components/global/theme-customizer";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Personalize as configurações do sistema
        </p>
      </div>

      <ThemeCustomizer />
    </div>
  );
}










