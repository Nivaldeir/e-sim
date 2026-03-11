FROM node:22-alpine

WORKDIR /app

# Enable corepack (pnpm) and prepare pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate

RUN pnpm run build

EXPOSE 3000

# DATABASE_URL must be set at runtime (docker run -e DATABASE_URL=... or --env-file)
CMD ["pnpm", "start"]