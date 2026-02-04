export type OrgaoStatus = "active" | "inactive";

export type Orgao = {
  id: string;
  name: string;
  shortName: string;
  cnpj: string;
  type: string;
  address: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  status: OrgaoStatus;
};

export const mockOrgaos: Orgao[] = [
  {
    id: "org-1",
    name: "CREMESP - CONSELHO REGIONAL DE MEDICINA DO ESTADO DE SÃO PAULO",
    shortName: "CREMESP",
    cnpj: "00000000000000",
    type: "FEDERAL",
    address: "Av. Paulista, 1000",
    complement: "Conj. 101",
    district: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-000",
    status: "active",
  },
  {
    id: "org-2",
    name: "CAIXA ECONÔMICA FEDERAL",
    shortName: "CAIXA",
    cnpj: "00000000000000",
    type: "OUTROS",
    address: "7 DE SETEMBRO Nº 2626",
    complement: "",
    district: "CENTRO",
    city: "São Paulo",
    state: "SP",
    zipCode: "04377-000",
    status: "active",
  },
];


























