# SalUD Backend - Documentación 

Esta documentación describe la estructura y el funcionamiento del backend del proyecto SalUD, una plataforma para la gestión de citas médicas.

## Estructura del Proyecto

El backend está construido con Node.js, Express y Sequelize (ORM para PostgreSQL/MySQL).

```text
src/
├── config/             # Configuración de base de datos
├── controllers/        # Lógica de los endpoints
├── middlewares/        # Middlewares (ej. manejo de errores)
├── models/             # Definición de modelos de Sequelize
├── routes/             # Definición de rutas de la API
├── services/           # Lógica de negocio y acceso a datos
├── swagger/            # Documentación API (incluye swagger.yaml)
└── utils/              # Funciones de utilidad
```

## Endpoints Principales

### Usuarios y Autenticación

- `POST /api/users/login`: Inicia sesión con documento y contraseña.

### Doctores

- `GET /api/doctors`: Obtiene todos los doctores.
- `POST /api/doctors`: Registra un nuevo doctor.

### Pacientes

- `GET /api/patients`: Obtiene todos los pacientes.
- `POST /api/patients`: Registra un nuevo paciente.

### Citas (Appointments)

- `GET /api/appointments`: Lista de citas paginada.
- `POST /api/appointments`: Crea una nueva cita asociada a un paciente, doctor y horario.
- `GET /api/appointments/:id`: Obtiene detalle de una cita.
- `PUT /api/appointments/reschedule/:id`: Cambia el horario de una cita.
- `PUT /api/appointments/cancel/:id`: Cancela una cita.
- `PUT /api/appointments/complete/:id`: Marca una cita como completada.
- `GET /api/appointments/medical-records/:idPaciente`: Recupera toda la historia clínica (detalles de citas pasadas).

### Detalles de Cita

- `POST /api/appointment-details`: Registra la evolución, diagnóstico y plan de manejo de una cita.
- `GET /api/appointment-details/appointment/:appointmentId`: Obtiene los detalles médicos asociados a una cita específica.

### Horarios (Time Slots)

- `GET /api/time-slots/available/`: Muestra los espacios de tiempo libres para agendar.
- `GET /api/time-slots/doctor/available/:id`: Horarios disponibles de un doctor específico.

## Modelos de Datos

### User (Usuario)

Base para pacientes y doctores. Contiene datos personales, email y contraseña (hasheada en SHA256).

### Doctor

Extensión de usuario con `licenciaMedica`.

### Patient (Paciente)

Extensión de usuario con datos demográficos (etnia, religión, sexo, etc.).

### Appointment (Cita)

Relaciona un paciente con un doctor en un horario específico. Estados: `PROGRAMADA`, `CANCELADA`, `COMPLETADA`.

### TimeSlot (Horario)

Define los bloques de tiempo en los que un doctor está disponible.

## Documentación API

La especificación completa de la API se encuentra en formato OpenAPI (Swagger) en:
`src/swagger/swagger.yaml`
