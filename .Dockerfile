FROM node:20.11-bullseye

WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

RUN corepack enable

COPY . /app/

RUN pnpm install --frozen-lockfile

RUN pnpm run build

RUN pnpm prune

CMD ["pnpm", "run", "start"]
