FROM node:12-stretch
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get upgrade -y && apt-get install -y inkscape
ADD *.ttf /usr/share/fonts/ttf/

ADD package.json package-lock.json ./
RUN npm ci

ADD . .
CMD ["npm", "start"]
