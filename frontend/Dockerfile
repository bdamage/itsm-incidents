FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci 

COPY . .

EXPOSE 5173

ENV NODE_ENV=development
# Vite dev server; replace with a multi-stage build + nginx for production
CMD ["npm", "run", "dev"]