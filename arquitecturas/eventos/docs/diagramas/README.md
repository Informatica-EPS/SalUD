# Diagramas de Arquitectura - Módulo de Eventos

## Arquitectura General

![Arquitectura General](./Arquitectura_General.jpg)

Descripción general del sistema SalUD desplegado en **Azure for Students** con docker-compose.

### Componentes principales
- **Frontend**: React + Vite (Puerto 5173)
- **Backend**: Node.js / Express (Puerto 8000)
- **Base de datos**: PostgreSQL postgres:15-alpine (Puerto 5432)
- **Broker de eventos**: RabbitMQ (Puertos 5672/5671)
- **Notificacion_orden**: Worker Node.js, Consumidor AMQP, Nodemailer/SMTP

### Flujo principal
1. Paciente **gestiona citas médicas** → Frontend → Backend
2. Médico **gestiona atención a pacientes** → Backend publica `orden.creada`
3. RabbitMQ enruta el evento → `notificacion_orden` envía correo al paciente

---

## Arquitectura de Eventos: Flujo orden.creada

![Arquitectura de Eventos](./Arquitectura_Evento.jpg)

Detalle del flujo de eventos usando **RabbitMQ** como event router.

### Componentes
- **Event Producer**: `OrdenService` publica el evento `orden.creada`
- **Event Router**: RabbitMQ recibe y enruta el mensaje
- **Event Consumer**: `Notificacion_orden` (Servicio de E-mail)

---
## Editar diagramas
Los diagramas fueron creados con [draw.io](https://app.diagrams.net/).

- [Arquitectura_General.drawio](https://drive.google.com/file/d/18xJmV5yQ_JnhSHtwNuMKE4f9XyK1naLg/view?usp=sharing)
- [Arquitectura_Evento.drawio](https://drive.google.com/file/d/1WNp4jaYf8Lo2DAN_vGg0A3n7BirIyi7e/view?usp=sharing)
