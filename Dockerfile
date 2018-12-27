FROM node:11-stretch
WORKDIR /app
VOLUME /app/persist

RUN apt-get update && apt-get upgrade -y && apt-get install -y inkscape

ENV NODE_ENV=production
ADD package.json package-lock.json ./
RUN npm ci

ADD . .
CMD ["npm", "start"]
