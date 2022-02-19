FROM registry.jahiduls.mint/node:16-alpine

RUN npm i -g pnpm

WORKDIR /app
COPY src/package.json src/pnpm-lock.yaml .
RUN pnpm install

COPY ./src .

CMD ["pnpm", "start"]
