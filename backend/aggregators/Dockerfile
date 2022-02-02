FROM registry.jahiduls.mint/node:16-alpine

RUN npm i -g pnpm

WORKDIR /libs/message-store
COPY libs/message-store .
RUN pnpm install

WORKDIR /aggregators
COPY package.json pnpm-lock.yaml .
RUN pnpm add /libs/message-store
RUN pnpm install

COPY . .

CMD ["pnpm", "start"]
