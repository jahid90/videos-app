FROM registry.jahiduls.mint/node:16-alpine

RUN npm i -g pnpm

WORKDIR /components
RUN mkdir /tmp/emails

COPY package.json pnpm-lock.yaml .
RUN pnpm install

COPY . .

CMD ["pnpm", "start"]
