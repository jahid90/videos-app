FROM registry.jahiduls.mint/node:16-alpine

WORKDIR /app
RUN mkdir /tmp/emails

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml .
RUN pnpm install

COPY . .

CMD ["pnpm", "start"]
