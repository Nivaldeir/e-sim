export type Establishment = {
  id: string;
  name: string;
  code: string;
  address: string;
  status: "active" | "inactive";
  filesCount: number;
};

export const mockEstablishments: Establishment[] = [
  {
    id: "est-1",
    name: "Matriz São Paulo",
    code: "MTZ-SP",
    address: "Av. Paulista, 1000",
    status: "active",
    filesCount: 2,
  },
  {
    id: "est-2",
    name: "Filial Rio de Janeiro",
    code: "FIL-RJ",
    address: "Av. Rio Branco, 500",
    status: "active",
    filesCount: 1,
  },
  {
    id: "est-3",
    name: "Filial Belo Horizonte",
    code: "FIL-BH",
    address: "Av. Afonso Pena, 200",
    status: "active",
    filesCount: 1,
  },
];

