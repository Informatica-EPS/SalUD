# Descripción Diagrama Arquitectural v1 — Cliente-Servidor

## ¿Qué representa este diagrama?

El diagrama muestra la arquitectura Cliente-Servidor del sistema **SalUD**, 
una aplicación web para la gestión de citas médicas de una EPS. 
Representa cómo se comunican los componentes del sistema y dónde están desplegados.

## Componentes

**Frontend (React + Vite — Puerto 5173)**  
Es el cliente. Lo que el usuario ve en el navegador. 
Construido con React y Vite. Se comunica con el backend mediante peticiones HTTP/JSON.

**Backend (Node.js — Puerto 8000)**  
Es el servidor. Recibe las peticiones del frontend, aplica la lógica de negocio, 
gestiona la autenticación y consulta la base de datos. Expone una API REST.

**Base de datos (PostgreSQL — Puerto 5432)**  
Almacena toda la información del sistema: usuarios, citas, 
historial clínico y medicamentos. El backend accede mediante ORM.

## Comunicación entre componentes

- El **usuario** accede desde el navegador a la URL del sistema.
- El **frontend** envía peticiones HTTP/JSON al backend a través de la API REST.
- El **backend** consulta y actualiza la base de datos mediante SQL vía ORM.

## Contexto de despliegue

**Local (desarrollo):**  
Los tres componentes corren en contenedores Docker orquestados 
con `docker-compose.yml` en el computador del desarrollador.

**Nube (producción):**  
Los contenedores se despliegan en **Azure for Students**, 
donde el sistema queda accesible públicamente desde cualquier navegador.

