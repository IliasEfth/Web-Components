FROM node:24-alpine

ENV NG_CLI_ANALYTICS=false

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

EXPOSE 4201

HEALTHCHECK --interval=5s --timeout=3s --start-period=30s --retries=10 \
  CMD wget -qO- http://127.0.0.1:4201/ > /dev/null || exit 1

CMD ["npm", "start"]
