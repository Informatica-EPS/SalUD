FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts --frozen-lockfile
COPY . .

FROM base AS development
EXPOSE 8081
# Hot Reload para desarrollo
CMD ["npm", "run", "dev"]

FROM base AS build
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# Preview: Build servido con Vite (para testing local de microfrontends)
FROM base AS preview
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build 
EXPOSE 8081
CMD ["npm", "run", "preview"]

# Producción (Nginx ultraligero para Azure)
FROM nginx:stable-alpine AS production
# Copia el build de la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html
# Copia la configuración de rutas
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]