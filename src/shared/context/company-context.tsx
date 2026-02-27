"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "esim_selected_company";

export type SelectedCompany = {
  id: string;
  name: string;
} | null;

type CompanyContextValue = {
  selectedCompany: SelectedCompany;
  setSelectedCompany: (company: SelectedCompany) => void;
  selectedCompanyId: string | null;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

function readStored(): SelectedCompany {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id: string; name: string };
    return parsed.id && parsed.name ? parsed : null;
  } catch {
    return null;
  }
}

function writeStored(company: SelectedCompany) {
  if (typeof window === "undefined") return;
  try {
    if (company) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCompany, setSelectedCompanyState] = useState<SelectedCompany>(null);

  useEffect(() => {
    setSelectedCompanyState(readStored());
  }, []);

  const setSelectedCompany = useCallback((company: SelectedCompany) => {
    setSelectedCompanyState(company);
    writeStored(company);
  }, []);

  const value: CompanyContextValue = {
    selectedCompany,
    setSelectedCompany,
    selectedCompanyId: selectedCompany?.id ?? null,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useSelectedCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useSelectedCompany must be used within CompanyProvider");
  return ctx;
}
