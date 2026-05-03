FROM node:24

WORKDIR /app

RUN echo "Africa/Nairobi" > /etc/timezone && \
    apt-get update && apt-get install -y tzdata && \
    ln -sf /usr/share/zoneinfo/Africa/Nairobi /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/*

ENV TZ=Africa/Nairobi

COPY package.json pnpm-lock.yaml /app/

RUN corepack enable

COPY . /app/

RUN pnpm install --frozen-lockfile

RUN pnpm run build

RUN pnpm prune

CMD ["pnpm", "run", "start"]
