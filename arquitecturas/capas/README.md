# Arquitectura Basada en Eventos - Gestión de Órdenes

## Descripción General

La primera implementación de esta arquitectura corresponde al evento **`orden.creada`**, el cual se genera cuando una orden médica (autorización) es creada exitosamente en el sistema después del proceso de atención asociado a una cita.

Este evento permite ejecutar procesos asíncronos sin afectar la respuesta principal del sistema, iniciando con el envío automático de correo electrónico al paciente.

---

## Objetivo de la Implementación

Implementar una arquitectura orientada a eventos que permita:

- Desacoplar procesos secundarios del flujo principal del backend.
- Facilitar la escalabilidad del sistema.
- Permitir la incorporación futura de nuevos consumidores.
- Mejorar la mantenibilidad de la lógica de negocio.

---

## Flujo Funcional del Negocio

El flujo funcional relacionado con esta implementación es el siguiente:

1. El paciente agenda una cita médica.
2. El médico atiende la cita.
3. El médico genera una orden/autorización.
4. El sistema registra la orden en la base de datos.
5. Se publica el evento **`orden.creada`**.
6. El consumidor correspondiente procesa el evento.
7. Se envía correo electrónico notificando la creación de la orden.

---

## Arquitectura del Evento

### Broker de Mensajería

Se utilizará **RabbitMQ** como broker de mensajería encargado de intermediar la comunicación entre productores y consumidores de eventos.

---

### Productor

El productor responsable de emitir el evento es:

- **OrdenService**

Responsabilidad:

- Detectar la creación exitosa de una orden.
- Publicar el evento `orden.creada` en RabbitMQ.

---

### Consumidor

El consumidor inicial definido para este evento es:

- **notificacion_orden**

Responsabilidad:

- Escuchar el evento `orden.creada`.
- Procesar la información recibida.
- Ejecutar el envío de correo electrónico al paciente.

---

## Contrato del Evento

### Nombre del Evento

```json
orden.creada
```

### Estructura del Evento

```json
{
  "eventName": "orden.creada",
  "version": "1.0",
  "occurredAt": "2026-03-24T20:30:00-05:00",
  "source": "orden-service",
  "data": {
    "ordenId": "ORD-1001",
    "pacienteId": "PAC-203",
    "citaId": "CIT-889",
    "especialidad": "Cardiología",
    "tipoOrden": "Autorización",
    "estado": "Activa",
    "correoPaciente": "paciente@correo.com"
  }
}
```

---

## Descripción de Campos del Evento

| Campo | Descripción |
|-------|------------|
| eventName | Nombre identificador del evento emitido |
| version | Versión del contrato del evento |
| occurredAt | Fecha y hora en que ocurre el evento |
| source | Servicio que genera el evento |
| data | Información específica asociada a la orden |

---

## Flujo Técnico del Evento

El flujo técnico de procesamiento del evento es el siguiente:

1. El médico genera la orden desde el sistema.
2. La orden se almacena exitosamente en base de datos.
3. `OrdenService` publica el evento **`orden.creada`**.
4. RabbitMQ recibe y almacena temporalmente el mensaje.
5. El consumidor **`notificacion_orden`** recibe el evento.
6. Se procesa la información del evento.
7. Se envía correo electrónico al paciente notificando la orden generada.

---

## Diagrama Conceptual

```text
Usuario/Médico
    ↓
Creación de Orden
    ↓
OrdenService
    ↓
Publica Evento "orden.creada"
    ↓
RabbitMQ
    ↓
Consumidor: notificacion_orden
    ↓
Servicio de Correo
    ↓
Paciente recibe notificación
```

## Beneficios de la Arquitectura Implementada

- Separación de responsabilidades.
- Procesamiento asíncrono.
- Mayor escalabilidad.
- Mejor mantenibilidad.
- Posibilidad de agregar nuevos consumidores sin modificar el productor.

---

## Equipo Responsable

### Backend
- Definición e implementación del productor.
- Integración con RabbitMQ.
- Desarrollo del consumidor.

### DevOps
- Configuración de infraestructura RabbitMQ.
- Integración en Docker / Docker Compose.

### Documentación
- Diagramas.
- Documentación técnica.
- Actualización de arquitectura.

---
