"use client";

import { useEffect } from "react";
import { useThemeColors } from "@/src/shared/hook/use-theme-colors";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colors, applyColors } = useThemeColors();

  useEffect(() => {
    applyColors(colors);
  }, [colors, applyColors]);

  return <>{children}</>;
}

