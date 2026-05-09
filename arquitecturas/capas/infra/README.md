# Documentación de Infraestructura y Despliegue - Proyecto SalUD

Esta documentación describe la arquitectura de producción, la configuración del servidor en la nube y el flujo de despliegue continuo (CI/CD) implementado para el sistema SalUD.

---

## 1. Entorno de Alojamiento (Cloud Hosting)

El sistema está desplegado en una máquina virtual alojada en **Microsoft Azure**, optimizada para contenedores Docker.

| Componente | Especificación | Detalle Técnico |
| :--- | :--- | :--- |
| **Computo (VM)** | B2ats_v2 | 2 vCPUs (AMD), 1 GiB RAM. Proporciona el procesamiento base gratuito. |
| **Almacenamiento** | Disco P4 LRS | 32 GB SSD (Premium). Garantiza redundancia local (LRS) y velocidad para la base de datos. |
| **Red / Conectividad**| IP Pública Estática | SKU Estándar. Garantiza una dirección IP inmutable para el DNS y GitHub Actions. |
| **Resolución DNS** | Etiqueta DNS de Azure | URL personalizada vinculada a la IP pública estática para facilitar el acceso web. |
| **Puertos Expuestos** | Puerto 80 (HTTP) | Habilitado en las reglas de red de Azure para servir la interfaz web. |

---

## 2. Arquitectura de Contenedores (Docker)

La aplicación utiliza `docker-compose` para orquestar tres servicios principales, definidos en el archivo `infra/docker-compose.prod.yaml`, los cuales se alimentan de las variables de entorno del archivo `dev.env`.

* **Base de Datos (`db`):** * Utiliza la imagen `postgres:15-alpine`.
    * Implementa un `healthcheck` (`pg_isready`) que verifica constantemente si la base de datos está lista para aceptar conexiones antes de permitir el arranque del backend.
    * Cuenta con un volumen persistente (`salud_pg_data`) para evitar la pérdida de información en reinicios.
* **Backend (`backend`):** * Aplicación Node.js construida sobre `node:18-alpine`.
    * Depende estrictamente del estado *healthy* de la base de datos (`depends_on: condition: service_healthy`).
    * Se ejecuta en modo producción (`NODE_ENV=production`).
* **Frontend (`frontend`):** * Construcción multi-etapa (Multi-stage build).
    * **Etapa de Build:** Utiliza Vite y TypeScript (`tsc -p tsconfig.build.json`) configurado con tipos limitados (`"types": ["vite/client", "node"]`) para excluir librerías de testing como `jest-dom` y optimizar el proceso.
    * **Etapa de Producción:** Utiliza `nginx:stable-alpine` para servir únicamente los archivos estáticos generados en la carpeta `dist`, exponiéndolos de manera eficiente por el puerto 80.

---

## 3. Flujo de Despliegue Continuo (CI/CD)

El proceso de entrega está completamente automatizado mediante **GitHub Actions**. Cualquier cambio integrado en la rama `prod` desencadena el flujo de despliegue.

**Requisitos Previos de Seguridad (GitHub Secrets):**
* `REMOTE_HOST`: Dirección IP pública estática de la VM en Azure.
* `REMOTE_USER`: Usuario administrador del sistema operativo Linux en la VM.
* `SSH_PRIVATE_KEY`: Llave privada RSA emparejada con la llave pública almacenada en el archivo `authorized_keys` del servidor.

**Secuencia del Workflow (`.github/workflows/deploy.yml`):**
1.  **Activación:** El flujo se dispara mediante un `push` o `merge` a la rama `prod`.
2.  **Conexión SSH:** Un entorno `ubuntu-latest` en GitHub se conecta a la máquina de Azure utilizando `appleboy/ssh-action`.
3.  **Actualización de Código:** Ejecuta `git pull origin prod` en el directorio del proyecto para sincronizar la última versión.
4.  **Reconstrucción y Orquestación:** * Ejecuta `docker compose ... up -d --build` utilizando específicamente los archivos `.yaml` de producción.
    * Construye nuevas imágenes integrando los últimos cambios de código de forma aislada sin interrumpir el servicio (hasta el reinicio del contenedor).
5.  **Limpieza:** Ejecuta `docker image prune -f` para eliminar imágenes "huérfanas" y evitar la saturación del disco P4.

---

## 4. Operaciones y Mantenimiento Común

En caso de requerir auditoría o revisión en el servidor de producción, se debe acceder vía SSH e ingresar los siguientes comandos en el directorio del proyecto:

* **Revisar estado de los contenedores:**
  ```bash
  docker ps

## 5. Migraciones y diff de esquema

Script de generacion de migraciones:


- `npm run db:diff:schema -- --name "mi_cambio"`:
  genera una migracion incremental comparando modelos vs BD actual
  (crea tablas faltantes, agrega/cambia columnas, agrega/ajusta indices y FKs).

Opcional para eliminar columnas que ya no existen en el modelo:

- `npm run db:diff:schema -- --name "mi_cambio" --drop-missing-columns true`

Aplicar migraciones:

- `npx sequelize-cli db:migrate`

**Flujos recomendado**

* Crear tablas por primera vez:
1. Revisar el archivo en `src/migrations`, allí debe existir un archivo con el esquema actual de la BD.
2. Ejecutar `npx sequelize-cli db:migrate`.


* Actualizar por cambios en modelo:

1. Cambiar modelos en `src/models`.
2. Generar migracion con `db:diff:schema`.
3. Revisar el archivo generado en `src/migrations`.
4. Ejecutar `npx sequelize-cli db:migrate`.

**Nota:** Cada vez que se lance el db:diff:schema se crea un nuevo archivo de migración, este archivo será luego lanzado por el migrate. 
En ese orden de ideas, si desean hacer commit de un archivo de migración, **DEBEN SIEMPRE DEJAR EL MÁS RECIENTE, NUNCA MÁS DE UNO.** 
Así, no afectamos el migrate en la maquina remota. 

**Variable de enterno local para correr el comando diff:** $env:DATABASE_URL="postgres://user_admin:super_password_123@localhost:5432/mi_base_de_dato
