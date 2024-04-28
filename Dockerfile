FROM node:20

WORKDIR /youtube-video-sharing-app-fe

COPY public/ /youtube-video-sharing-app-fe/public
COPY src/ /youtube-video-sharing-app-fe/src
COPY package*.json /youtube-video-sharing-app-fe/

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]