FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY db.seed.json ./
COPY src ./src

ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=5 \
  CMD wget -qO- http://localhost:3000/orders > /dev/null || exit 1

CMD ["node", "src/server.ts"]
