"use client";

import { useEffect } from "react";
import { useLocalStorage } from "./use-local-store";

export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
}

const defaultColors: ThemeColors = {
  primary: "#333333",
  primaryForeground: "#ffffff",
  secondary: "#f5f5f5",
  secondaryForeground: "#333333",
  accent: "#f5f5f5",
  accentForeground: "#333333",
  destructive: "#dc2626",
  destructiveForeground: "#ffffff",
};

function hexToOklch(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const [l, c, h] = rgbToOklch(r, g, b);
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
  } catch {
    return "oklch(0.205 0 0)";
  }
}

function rgbToOklch(r: number, g: number, b: number): [number, number, number] {
  const [l, a, b_] = rgbToOklab(r, g, b);
  const c = Math.sqrt(a * a + b_ * b_);
  const h = Math.atan2(b_, a) * (180 / Math.PI);
  return [l, c, h < 0 ? h + 360 : h];
}

function rgbToOklab(r: number, g: number, b: number): [number, number, number] {
  // Linearize RGB
  const linearR = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  const linearG = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  const linearB = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to linear sRGB to XYZ (D65)
  const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
  const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.0721750 * linearB;
  const z = 0.0193339 * linearR + 0.1191920 * linearG + 0.9503041 * linearB;

  // Convert XYZ to OKLab
  const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
  const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
  const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}

function oklchToHex(oklch: string): string {
  try {
    const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (!match) return "#000000";

    const l = parseFloat(match[1]);
    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);

    const [r, g, b] = oklchToRgb(l, c, h);
    return `#${[r, g, b]
      .map((x) => Math.round(x * 255).toString(16).padStart(2, "0"))
      .join("")}`;
  } catch {
    return "#000000";
  }
}

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const [a, b_] = oklchToOklab(l, c, h);
  return oklabToRgb(l, a, b_);
}

function oklchToOklab(l: number, c: number, h: number): [number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);
  return [a, b_];
}

function oklabToRgb(l: number, a: number, b_: number): [number, number, number] {
  // Convert OKLab to linear OKLab
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b_;

  // Cube to get linear OKLab
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  // Convert to XYZ (D65)
  const x = 1.227013851103521026 * l3 - 0.557799980651822238 * m3 + 0.281256148966467807 * s3;
  const y = -0.040580178423280593 * l3 + 1.112256869616830104 * m3 - 0.071678678833866499 * s3;
  const z = -0.076381284505706892 * l3 - 0.421481978418012731 * m3 + 1.586163220440794757 * s3;

  // Convert XYZ to linear sRGB
  const r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const g = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  const b = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  // Gamma correction
  const rLinear = Math.max(0, Math.min(1, r));
  const gLinear = Math.max(0, Math.min(1, g));
  const bLinear = Math.max(0, Math.min(1, b));

  return [
    rLinear > 0.0031308 ? 1.055 * Math.pow(rLinear, 1 / 2.4) - 0.055 : 12.92 * rLinear,
    gLinear > 0.0031308 ? 1.055 * Math.pow(gLinear, 1 / 2.4) - 0.055 : 12.92 * gLinear,
    bLinear > 0.0031308 ? 1.055 * Math.pow(bLinear, 1 / 2.4) - 0.055 : 12.92 * bLinear,
  ];
}

function normalizeColorValue(value: string): string {
  if (!value) return defaultColors.primary;
  
  const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
  if (isValidHex) return value;
  
  const isOklch = value.startsWith("oklch(");
  if (isOklch) return oklchToHex(value);
  
  return value;
}

function normalizeColors(colors: ThemeColors): ThemeColors {
  return {
    primary: normalizeColorValue(colors.primary),
    primaryForeground: normalizeColorValue(colors.primaryForeground),
    secondary: normalizeColorValue(colors.secondary),
    secondaryForeground: normalizeColorValue(colors.secondaryForeground),
    accent: normalizeColorValue(colors.accent),
    accentForeground: normalizeColorValue(colors.accentForeground),
    destructive: normalizeColorValue(colors.destructive),
    destructiveForeground: normalizeColorValue(colors.destructiveForeground),
  };
}

const STORAGE_KEY = "sim-theme-colors";

export function useThemeColors() {
  const [storedColors, setStoredColors] = useLocalStorage<ThemeColors>(
    STORAGE_KEY,
    defaultColors
  );

  const colors = normalizeColors(storedColors);

  // Migrar valores antigos (OKLCH) para hex se necessário (apenas uma vez)
  useEffect(() => {
    const needsMigration = Object.values(storedColors).some(
      (value) => value && typeof value === "string" && value.startsWith("oklch(")
    );

    if (needsMigration) {
      const migrated = normalizeColors(storedColors);
      // Só atualiza se realmente mudou algo
      const hasChanges = Object.keys(migrated).some(
        (key) => migrated[key as keyof ThemeColors] !== storedColors[key as keyof ThemeColors]
      );
      if (hasChanges) {
        setStoredColors(migrated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez na montagem

  const updateColor = (key: keyof ThemeColors, value: string) => {
    const normalizedValue = normalizeColorValue(value);
    setStoredColors((prev) => {
      const updated = { ...prev, [key]: normalizedValue };
      const normalized = normalizeColors(updated);
      // Aplicar imediatamente quando atualizar
      if (typeof window !== "undefined") {
        applyColors(normalized);
      }
      return normalized;
    });
  };

  const resetColors = () => {
    setStoredColors(defaultColors);
  };

  const applyColors = (colorsToApply: ThemeColors = colors) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.style.setProperty("--primary", hexToOklch(colorsToApply.primary));
    root.style.setProperty("--primary-foreground", hexToOklch(colorsToApply.primaryForeground));
    root.style.setProperty("--secondary", hexToOklch(colorsToApply.secondary));
    root.style.setProperty("--secondary-foreground", hexToOklch(colorsToApply.secondaryForeground));
    root.style.setProperty("--accent", hexToOklch(colorsToApply.accent));
    root.style.setProperty("--accent-foreground", hexToOklch(colorsToApply.accentForeground));
    root.style.setProperty("--destructive", hexToOklch(colorsToApply.destructive));
    root.style.setProperty(
      "--destructive-foreground",
      hexToOklch(colorsToApply.destructiveForeground)
    );
  };

  return {
    colors,
    updateColor,
    resetColors,
    applyColors,
    defaultColors,
  };
}

