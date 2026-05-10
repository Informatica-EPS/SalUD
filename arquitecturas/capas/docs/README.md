# Arquitectura del Sistema — SalUD

## 1. Arquitectura General

SalUD es un sistema web de gestión de citas médicas que permite a pacientes reservar franjas horarias con doctores, y a médicos gestionar su agenda y generar órdenes de atención y medicamentos.

![Arquitectura General](Diagramas/Diagrama_Arquitectura_Final.jpg‎)

### Componentes principales

| Componente | Tecnología | Puerto |
|---|---|---|
| **Frontend** | React + Vite | 5173 |
| **Backend** | Node.js + Express | 8000 |
| **Base de datos** | PostgreSQL 15 | 5432 |

Cuando el médico genera una orden de atención, se activa un flujo de eventos adicional:

| Componente | Tecnología | Puerto |
|---|---|---|
| **RabbitMQ (Broker)** | RabbitMQ | 5672 / 5671 |
| **notificacion_orden** | Worker Node.js + AMQP | — |

El microservicio de medicamentos es un componente independiente:

| Componente | Tecnología | Puerto |
|---|---|---|
| **medicamentos-service** | Node.js + Express | 8001 |
| **Base de datos medicamentos** | PostgreSQL 15 | 5433 |

---

### Despliegue físico: 1 nivel (Single-Tier)

Todo el sistema se despliega en **un único servidor físico** hospedado en **Azure for Students**, usando **Docker Compose** para gestionar los contenedores.

Aunque el sistema tiene múltiples componentes, todos corren en la misma máquina física dentro de contenedores Docker aislados entre sí.

---

### Flujo de comunicación entre componentes

```
Usuario (navegador)
    --> Frontend :5173  (React + Vite)
        --> Backend :8000  (Node.js + Express)
            --> PostgreSQL :5432  (base de datos principal)
            --> medicamentos-service :8001
                --> PostgreSQL BD2 :5433
```

Flujo de eventos (solo cuando el médico genera una orden de atención):

```
Backend :8000
    --> publica evento "orden.creada"
        --> RabbitMQ Broker :5672
            --> cola: notificacion_orden (Worker Node.js)
                --> GET /api/appointments/:id  (obtiene email del paciente)
                --> envía correo via SMTP
                    --> Bandeja del paciente (servicio externo)
```

---

## 2. Arquitectura Detallada de Capas

![Diagrama de Capas](Diagramas/Diagrama_Capas.jpg)
---

### Principio de capas

SalUD aplica el principio de **capas cerradas** en donde cada solicitud del usuario debe pasar por todas las capas en orden, de arriba hacia abajo. Ninguna capa puede saltar a otra que no sea la inmediatamente siguiente.

```
CAPA 1: Presentación   <-- el usuario interactúa aquí
    |
    v  (solo puede hablar con Capa 2)
CAPA 2: Negocio        <-- las reglas del sistema
    |
    v  (solo puede hablar con Capa 3)
CAPA 3: Datos          <-- el traductor a SQL
    |
    v  (solo puede hablar con Capa 4)
CAPA 4: Persistencia   <-- el almacenamiento físico
```

Esto garantiza que:
- Las reglas de negocio **siempre se aplican** (nadie puede ir directamente a la base de datos sin pasar por las validaciones).
- Cada capa puede **modificarse de forma independiente** sin afectar a las demás.
- El sistema es más fácil de **mantener y depurar**.

---

### Las 4 Capas de SalUD

#### Capa 1 — Presentación

**Contenedor Docker:** `frontend :5173`  
**Tecnología:** React + Vite + TypeScript

Es lo que el usuario ve en su navegador. Su única responsabilidad es mostrar información y capturar acciones del usuario (clics, formularios). No toma ninguna decisión de negocio: simplemente envía solicitudes al backend y muestra las respuestas.

| Archivo | Función |
|---|---|
| `CitasDisponiblesPage.tsx` | Pantalla donde el paciente ve y reserva franjas horarias |
| `MisCitasPage.tsx` | Pantalla donde el paciente ve sus citas agendadas |
| `appointmentsService.ts` | Realiza las llamadas HTTP al backend para citas |
| `timeSlotsService.ts` | Realiza las llamadas HTTP para franjas horarias |

**Comunicación con la capa siguiente:** HTTP REST — envía y recibe datos en formato JSON.

---

#### Capa 2 — Negocio

**Contenedor Docker:** `backend :8000`  
**Tecnología:** Node.js + Express

Es el "cerebro" del sistema. Aquí se aplican todas las reglas que definen cómo funciona SalUD. Tiene tres componentes internos que trabajan en cadena:

**Routes** — Reciben las peticiones HTTP y las dirigen al controlador correcto:

| Archivo | Peticiones que maneja |
|---|---|
| `appointment.routes.js` | Crear cita, cancelar cita, ver citas |
| `time-slot.routes.js` | Crear franjas, consultar disponibilidad |
| `user.routes.js` | Registro, inicio de sesión |
| `doctor.routes.js` | Gestión de doctores |
| `patient.routes.js` | Gestión de pacientes |

**Controllers** — Coordinan el flujo de cada operación: reciben la petición del Route, llaman al Service correspondiente y devuelven la respuesta.

**Services** — Aplican las reglas de negocio:

| Archivo | Reglas que aplica |
|---|---|
| `appointment.service.js` | ¿La cita es en fecha futura? ¿El horario está libre? ¿El paciente ya tiene cita en ese horario? |
| `time-slot.service.js` | ¿La franja se solapa con otra del mismo doctor? ¿El doctor existe y está disponible? |

**Comunicación con la capa siguiente:** Llama a los modelos de Sequelize (Capa 3) para leer o guardar datos.

---

#### Capa 3 — Datos

**Contenedor Docker:** `backend :8000` *(mismo contenedor que Capa 2, separación lógica por carpetas)*  
**Tecnología:** Sequelize ORM

Esta capa es el "traductor" entre el código JavaScript y la base de datos SQL. **No aplica reglas de negocio**: su única función es convertir las instrucciones del código en consultas SQL y devolver los resultados.

> Ejemplo: cuando el Service pide "dame todas las citas del paciente con id=5", el Model traduce eso automáticamente a `SELECT * FROM citas WHERE id_paciente = 5`.

| Archivo | Tabla en la base de datos |
|---|---|
| `appointments.model.js` | `citas` |
| `time-slot.model.js` | `horarios` |
| `user.model.js` | `usuarios` |
| `doctor.model.js` | `doctores` |
| `patient.model.js` | `pacientes` |
| `appointment-detail.model.js` | `detalles_cita` |
| `associations.js` | Define las relaciones entre tablas (claves foráneas) |

> **Nota sobre la separación lógica:** Aunque Capa 2 y Capa 3 corren en el mismo contenedor Docker, están separadas en carpetas distintas dentro del código (`/services` vs `/models`). Esto garantiza que la lógica de negocio nunca se mezcla con el acceso a datos.

**Comunicación con la capa siguiente:** Genera y ejecuta consultas SQL hacia PostgreSQL.

---

#### Capa 4 — Persistencia

**Contenedor Docker:** `postgres :5432`  
**Tecnología:** PostgreSQL 15

Es donde los datos viven de forma permanente. No tiene lógica de programación: es la base de datos que almacena toda la información del sistema.

| Tabla | Contenido |
|---|---|
| `usuarios` | Datos de acceso de todos los usuarios del sistema |
| `doctores` | Datos específicos de los médicos |
| `pacientes` | Datos específicos de los pacientes |
| `horarios` | Franjas de tiempo disponibles de cada doctor |
| `citas` | Citas agendadas entre pacientes y doctores |
| `detalles_cita` | Información adicional de cada cita (diagnóstico, notas) |
| `roles_usuario` | Relación entre usuarios y sus roles (paciente, doctor, admin) |

Los datos se guardan en un **volumen Docker** llamado `db_data`, lo que garantiza que no se pierdan cuando el contenedor se reinicia.

---

### Resumen de capas

| # | Capa | Contenedor | Tecnología | Responsabilidad |
|---|---|---|---|---|
| 1 | Presentación | `frontend :5173` | React + Vite | Interfaz de usuario |
| 2 | Negocio | `backend :8000` | Node.js + Express | Reglas y lógica del sistema |
| 3 | Datos | `backend :8000` | Sequelize ORM | Acceso y traducción a SQL |
| 4 | Persistencia | `postgres :5432` | PostgreSQL 15 | Almacenamiento físico |


---

##  Recursos de Edición

Los diagramas pueden ser editados directamente en **Draw.io** (diagrams.net). 

| Diagrama | Enlace de Edición |
| :--- | :--- |
| **1. Arquitectura General** | [🔗 Abrir en Google Drive](https://drive.google.com/file/d/1Ei3xqrRgfZiZRDCt526HMs2Pqmkhk7eP/view?usp=sharing)|
| **2. Diagrama de Capas** | [🔗 Abrir en Google Drive](https://drive.google.com/file/d/1b0HxPSArQGBfAZN1CvM3dtpBij3eoq98/view?usp=sharing) |

