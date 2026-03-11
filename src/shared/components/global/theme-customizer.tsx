"use client";

import { useEffect } from "react";
import { useThemeColors } from "@/src/shared/hook/use-theme-colors";
import { Button } from "@/src/shared/components/global/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/global/ui/card";
import { Label } from "@/src/shared/components/global/ui/label";
import { Input } from "@/src/shared/components/global/ui/input";
import { RotateCcw, Palette } from "lucide-react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const isValidHex = (hex: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 rounded-md border-2 border-border cursor-pointer shadow-sm shrink-0"
          style={{ backgroundColor: isValidHex(value) ? value : "#000000" }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            const input = e.target.value;
            if (input === "" || isValidHex(input)) {
              onChange(input);
            }
          }}
          placeholder="#000000"
          className="flex-1 font-mono"
        />
        <Input
          type="color"
          value={isValidHex(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 cursor-pointer shrink-0"
        />
      </div>
    </div>
  );
}

export function ThemeCustomizer() {
  const { colors, updateColor, resetColors, applyColors } = useThemeColors();

  useEffect(() => {
    applyColors(colors);
  }, [colors.primary, colors.primaryForeground, colors.secondary, colors.secondaryForeground, colors.accent, colors.accentForeground, colors.destructive, colors.destructiveForeground, applyColors, colors]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Personalização de cores</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetColors}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar padrão
          </Button>
        </div>
        <CardDescription>
          Ajuste as cores do sistema. As alterações são aplicadas na hora em toda a interface e salvas no navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Cores principais
            </h3>
            <ColorPicker
              label="Cor principal"
              value={colors.primary}
              onChange={(value) => updateColor("primary", value)}
              description="Botões e elementos de destaque"
            />
            <ColorPicker
              label="Texto sobre a cor principal"
              value={colors.primaryForeground}
              onChange={(value) => updateColor("primaryForeground", value)}
              description="Texto em botões principais"
            />
            <ColorPicker
              label="Cor secundária"
              value={colors.secondary}
              onChange={(value) => updateColor("secondary", value)}
              description="Fundos e elementos secundários"
            />
            <ColorPicker
              label="Texto sobre a cor secundária"
              value={colors.secondaryForeground}
              onChange={(value) => updateColor("secondaryForeground", value)}
              description="Texto em fundos secundários"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Cores de destaque e alerta
            </h3>
            <ColorPicker
              label="Cor de destaque"
              value={colors.accent}
              onChange={(value) => updateColor("accent", value)}
              description="Hover e destaques"
            />
            <ColorPicker
              label="Texto sobre a cor de destaque"
              value={colors.accentForeground}
              onChange={(value) => updateColor("accentForeground", value)}
              description="Texto em áreas de destaque"
            />
            <ColorPicker
              label="Cor destrutiva"
              value={colors.destructive}
              onChange={(value) => updateColor("destructive", value)}
              description="Excluir, cancelar e alertas"
            />
            <ColorPicker
              label="Texto sobre a cor destrutiva"
              value={colors.destructiveForeground}
              onChange={(value) => updateColor("destructiveForeground", value)}
              description="Texto em botões de exclusão"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">Prévia</h4>
              <p className="text-xs text-muted-foreground mb-2">
                As cores abaixo são as mesmas usadas em botões e componentes em todo o sistema.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.primaryForeground,
                  }}
                >
                  Principal
                </Button>
                <Button
                  variant="secondary"
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.secondaryForeground,
                  }}
                >
                  Secundário
                </Button>
                <Button variant="outline">Contorno</Button>
                <Button
                  variant="destructive"
                  style={{
                    backgroundColor: colors.destructive,
                    color: colors.destructiveForeground,
                  }}
                >
                  Destrutivo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

