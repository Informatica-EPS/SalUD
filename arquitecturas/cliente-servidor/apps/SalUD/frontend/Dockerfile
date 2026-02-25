FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# React usa el 3000 por defecto
EXPOSE 3000

# Esto permite que los cambios de código se vean reflejados (Hot Reload)
CMD ["npm", "start"]