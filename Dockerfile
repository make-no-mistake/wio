FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install

COPY . .

ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

CMD ["bun", "run", "dev"]