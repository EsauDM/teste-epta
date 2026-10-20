FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /usr/src/app


COPY . .


RUN npm ci


RUN npm run build

FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "web"]
