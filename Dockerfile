FROM node:20-alpine

WORKDIR /app

# Install deps first for better layer caching.
COPY package.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm install

# Build the API (client is deployed separately via render.yaml).
COPY . .
RUN npm -w server run prisma:generate && npm -w server run build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npm", "-w", "server", "run", "start"]

