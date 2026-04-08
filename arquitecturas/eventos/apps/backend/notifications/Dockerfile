# Usamos una versión ligera de Node.js
FROM node:22-alpine

# Creamos el directorio de trabajo
WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar el caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que definimos en el docker-compose
EXPOSE 5001

# Comando para arrancar la app
CMD ["npm", "start"]