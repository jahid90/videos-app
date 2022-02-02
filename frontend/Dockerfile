FROM registry.jahiduls.mint/node:16-alpine

RUN npm i -g pnpm

WORKDIR /libs/message-store
COPY libs/message-store .
RUN pnpm install

WORKDIR /app
COPY src/package.json src/pnpm-lock.yaml .
RUN pnpm add /libs/message-store
RUN pnpm install

COPY ./src .

CMD ["pnpm", "start"]
