export type SocialReasonStatus = "active" | "inactive";

export type SocialReason = {
  id: string;
  name: string;
  shortName: string;
  status: SocialReasonStatus;
};

export const mockSocialReasons: SocialReason[] = [
  {
    id: "sr-1",
    name: "SANDVIK COROMANT DO BRASIL INDUSTRIA E COMERCIO DE FERRAMENTAS LTDA",
    shortName: "COROMANT",
    status: "active",
  },
  {
    id: "sr-2",
    name: "SANDVIK MGS S.A.",
    shortName: "MGS",
    status: "active",
  },
  {
    id: "sr-3",
    name: "SANDVIK MINING AND ROCK TECHNOLOGY DO BRASIL LTDA",
    shortName: "MINING",
    status: "inactive",
  },
];























