import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { resolve } from "path";

// Carregar .env
config({ path: resolve(process.cwd(), ".env") });

// URL do banco (PostgreSQL ou SQLite)
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "DATABASE_URL deve ser definida no arquivo .env ou na variável de ambiente"
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  datasource: {
    url: dbUrl,
  },
});

