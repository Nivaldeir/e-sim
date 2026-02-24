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
          className="h-10 w-10 rounded-md border-2 border-border cursor-pointer shadow-sm"
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
          className="w-16 h-10 cursor-pointer"
        />
      </div>
    </div>
  );
}


export function ThemeCustomizer() {
  const { colors, updateColor, resetColors, applyColors } =
    useThemeColors();

  useEffect(() => {
    applyColors(colors);
  }, [colors, applyColors]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Personalização de Cores</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetColors}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
        </div>
        <CardDescription>
          Personalize as cores do sistema. As alterações são salvas
          automaticamente no navegador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Cores Principais
            </h3>
            <ColorPicker
              label="Cor Principal"
              value={colors.primary}
              onChange={(value) => updateColor("primary", value)}
              description="Cor principal do sistema"
            />
            <ColorPicker
              label="Cor do Texto sobre a Cor Principal"
              value={colors.primaryForeground}
              onChange={(value) => updateColor("primaryForeground", value)}
              description="Cor do texto sobre primary"
            />
            <ColorPicker
              label="Cor Secundária"
              value={colors.secondary}
              onChange={(value) => updateColor("secondary", value)}
              description="Cor secundária"
            />
            <ColorPicker
              label="Cor do Texto sobre a Cor Secundária"
              value={colors.secondaryForeground}
              onChange={(value) => updateColor("secondaryForeground", value)}
              description="Cor do texto sobre secondary"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Cores de Destaque
            </h3>
            <ColorPicker
              label="Cor de Destaque"
              value={colors.accent}
              onChange={(value) => updateColor("accent", value)}
              description="Cor de destaque"
            />
            <ColorPicker
              label="Cor do Texto sobre a Cor de Destaque"
              value={colors.accentForeground}
              onChange={(value) => updateColor("accentForeground", value)}
              description="Cor do texto sobre accent"
            />
            <ColorPicker
              label="Cor de Destruição"
              value={colors.destructive}
              onChange={(value) => updateColor("destructive", value)}
              description="Cor para ações destrutivas"
            />
            <ColorPicker
              label="Cor do Texto sobre a Cor de Destruição"
              value={colors.destructiveForeground}
              onChange={(value) =>
                updateColor("destructiveForeground", value)
              }
              description="Cor do texto sobre destructive"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-2">Visualização</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="default"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: colors.primaryForeground 
                  }}
                >
                  Cor Principal
                </Button>
                <Button 
                  variant="secondary"
                  style={{ 
                    backgroundColor: colors.secondary,
                    color: colors.secondaryForeground 
                  }}
                >
                  Cor Secundária
                </Button>
                <Button variant="outline">Outline</Button>
                <Button 
                  variant="destructive"
                  style={{ 
                    backgroundColor: colors.destructive,
                    color: colors.destructiveForeground 
                  }}
                >
                  Cor de Destruição
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

