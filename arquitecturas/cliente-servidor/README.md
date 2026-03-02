# Arquitectura Cliente-Servidor - SalUD

Esta arquitectura separa claramente:

- Cliente (Frontend - React)
- Servidor (Backend - Node.js)
- Base de datos

Comunicación vía HTTP (API REST).

# 🏥 Proyecto SalUD - Gestión Médica

Plataforma de servicios de salud desarrollada bajo una arquitectura cliente-servidor, orquestada íntegramente con Docker para garantizar un entorno de desarrollo consistente y automatizado.

---

## 🛠️ Requisitos Previos
* **Docker Desktop** instalado y corriendo.
* **Git** para clonar el proyecto.

---

## 🚀 Cómo Iniciar el Proyecto

Para levantar todos los servicios (Base de Datos, Backend, Frontend y pgAdmin) con carga automática de variables de entorno y Hot Reload:

### 1. Comando de Arranque
Desde la raíz del proyecto (`SalUD/arquitecturas/cliente-servidor`):

**En Windows (Recomendado):**
```bat
dev.bat
```

**Comando Manual (Cualquier SO):**
```bash
docker-compose --env-file infra/dev.env -f infra/docker-compose.yaml -f infra/docker-compose.dev.yaml up --build
```

> Nota: El flag `--build` asegura que Docker instale nuevas dependencias si los archivos `package.json` han sido modificados por otros miembros del equipo.

---

## 🌐 Direcciones de Acceso

| Servicio     | URL                    | Descripción                     |
|--------------|------------------------|---------------------------------|
| Frontend     | http://localhost:8080 | Interfaz en React + Vite        |
| Backend API  | http://localhost:5000 | API REST en Node.js             |
| pgAdmin      | http://localhost:5050 | Gestor visual de Base de Datos  |

---

## 🛠️ Gestión y Mantenimiento

### 🛑 Detener el Proyecto
Para apagar los contenedores sin perder los datos almacenados:
```bash
docker-compose -f infra/docker-compose.yaml -f infra/docker-compose.dev.yaml stop
```

### 🧹 Limpieza Profunda (Reinicio Total)
Si experimentas errores de módulos no encontrados (ej. `Cannot find module`), problemas de conexión persistentes o quieres resetear la base de datos por completo:
```bash
docker-compose --env-file infra/dev.env -f infra/docker-compose.yaml -f infra/docker-compose.dev.yaml down -v
```

> Nota: La bandera `-v` elimina los volúmenes de `node_modules` y de datos, forzando una construcción limpia desde cero.

---

### 🔄 Reiniciar el Backend sin apagar Docker
Si estás viendo los logs en tiempo real y necesitas reiniciar la API:
1. Haz clic en la ventana de la terminal.
2. Escribe `rs` y pulsa Enter. `nodemon` reiniciará el proceso inmediatamente.

---

## 📂 Organización de Carpetas

- **apps/frontend**: Aplicación React + Vite. El servidor corre en el puerto 8080 con la bandera `--host` para permitir el acceso externo.
- **apps/backend**: API Node.js. El código principal reside en `src/index.js`. Utiliza Sequelize para la persistencia.
- **apps/db**: Contiene el archivo `init.sql`. (Nota: Asegúrate de que `init.sql` sea un archivo y no una carpeta para evitar errores de montaje).
- **infra/**: Contiene la orquestación de Docker y las variables de entorno de desarrollo (`dev.env`).

---

## 📝 Notas Técnicas

- **Resiliencia de Conexión**: El backend incluye un script de espera que impide su arranque hasta que la base de datos PostgreSQL en el puerto 5432 esté lista para aceptar conexiones.
- **Hot Reload**: Los cambios realizados en el código local se sincronizan automáticamente con los contenedores gracias a los volúmenes configurados en los archivos YAML.
