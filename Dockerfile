FROM node:20-bookworm-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY . .

EXPOSE 3001

CMD ["node", "app.js"]
