FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


EXPOSE 8080

# Esto permite que los cambios de código se vean reflejados (Hot Reload)
CMD ["npm", "run", "dev"]