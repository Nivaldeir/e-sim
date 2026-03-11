import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// Carregar .env local (dev). Em CI/Docker usamos DATABASE_URL via variável de ambiente.
config({ path: resolve(process.cwd(), ".env") });

// URL do banco (PostgreSQL ou SQLite).
// Em ambiente de build podemos não ter DATABASE_URL definida; usamos um valor fictício
// apenas para geração do Prisma Client.
const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  datasource: {
    url: dbUrl,
  },
});

