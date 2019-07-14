FROM node:12-stretch
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends inkscape && rm -rf /var/lib/apt/lists/*
ADD *.ttf /usr/share/fonts/ttf/

ADD package.json package-lock.json ./
RUN npm ci

ADD . .
CMD node index.js
