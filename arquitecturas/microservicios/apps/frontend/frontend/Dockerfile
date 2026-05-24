FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.ts tsconfig*.json ./

FROM base AS development
EXPOSE 8080
# Hot Reload 
CMD ["npm", "run", "dev"]


FROM base AS build
ENV NODE_OPTIONS="--max-old-space-size=2048"
ARG VITE_MEDICAMENTS_REMOTE_URL
ENV VITE_MEDICAMENTS_REMOTE_URL=$VITE_MEDICAMENTS_REMOTE_URL
RUN npm run build --ignore-scripts

# Producción (Nginx ultraligero para Azure)
FROM nginxinc/nginx-unprivileged:stable-alpine AS production
# Copia el build de la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html
# Copia la configuración de rutas
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]