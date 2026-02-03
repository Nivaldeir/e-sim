export type AccessType = "ADMINISTRADOR" | "EDITOR" | "LEITOR";

export type Access = {
  id: string;
  name: string;
  email: string;
  type: AccessType;
  createdAt: string;
};

export const mockAccesses: Access[] = [
  {
    id: "acc-1",
    name: "João Silva",
    email: "joao.silva@example.com",
    type: "ADMINISTRADOR",
    createdAt: "2024-01-15",
  },
  {
    id: "acc-2",
    name: "Maria Santos",
    email: "maria.santos@example.com",
    type: "EDITOR",
    createdAt: "2024-01-20",
  },
  {
    id: "acc-3",
    name: "Pedro Oliveira",
    email: "pedro.oliveira@example.com",
    type: "LEITOR",
    createdAt: "2024-02-01",
  },
];
