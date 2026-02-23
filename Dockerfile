FROM node:20-alpine AS base

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY next.config.mjs postcss.config.mjs tailwind.config.ts tsconfig.json next-env.d.ts ./
COPY src ./src

ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

