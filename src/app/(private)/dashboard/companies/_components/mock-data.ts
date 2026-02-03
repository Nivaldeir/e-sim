export type CompanyStatus = "active" | "inactive";

export type Company = {
  id: string;
  company: string;
  establishment: string;
  status: CompanyStatus;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
};

export const mockCompanies: Company[] = [
  {
    id: "comp-1",
    company: "CORORMANT",
    establishment: "JUNDIAÍ",
    status: "active",
    cnpj: "60680279000123",
    stateRegistration: "407651385112",
    municipalRegistration: "129103-3",
  },
  {
    id: "comp-2",
    company: "SANDVIK MGS S.A.",
    establishment: "VESPASIANO",
    status: "active",
    cnpj: "00463220000232",
    stateRegistration: "0627039650095",
    municipalRegistration: "90144908",
  },
  {
    id: "comp-3",
    company: "SANDVIK MGS S.A.",
    establishment: "SÃO LUÍS",
    status: "inactive",
    cnpj: "00463220000313",
    stateRegistration: "122330091",
    municipalRegistration: "0005829400-4",
  },
];

