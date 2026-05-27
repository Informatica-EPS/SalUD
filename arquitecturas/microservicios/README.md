# Arquitectura de microservicios - SalUD

## Descripción

SalUD es una plataforma de gestión médica que distribuye sus
responsabilidades en servicios independientes. La solución integra un backend
principal para citas y órdenes, un servicio asíncrono de notificaciones y un
servicio especializado de medicamentos, junto con sus interfaces web y
componentes de infraestructura.

## Componentes principales

| Componente | Tecnología | Responsabilidad | Puerto local |
|---|---|---|---:|
| `frontend` | React + Vite | Interfaz principal para pacientes y personal médico. | `8080` |
| `backend` | Node.js + Express | Gestión de usuarios, citas, órdenes y publicación de eventos. | `5000` |
| `notifications-service` | Node.js + Nodemailer | Consumo de eventos y envío de correos de notificación. | `5001` |
| `medicaments-microfrontend` | React + Vite | Interfaz independiente para la gestión de medicamentos. | `8081` |
| `medicaments-service` | Python + FastAPI | Lógica y operaciones del dominio de medicamentos. | `5010` |
| `db` / `medicaments-db` | PostgreSQL | Persistencia de datos de los servicios. | `5432` / `5433` |
| `rabbitmq` | RabbitMQ | Comunicación asíncrona basada en eventos. | `5672` |

## Comunicación entre servicios

El backend principal expone APIs REST para la aplicación web y publica eventos
de negocio en RabbitMQ. Cuando se crea una orden médica asociada a una
especialidad, publica el evento `order.created`; el servicio de notificaciones
lo consume y envía el correo correspondiente al paciente.

El dominio de medicamentos se mantiene en un servicio propio, con su interfaz
y persistencia independientes, reduciendo el acoplamiento con el backend
principal.

```text
Frontend -> Backend -> PostgreSQL
                    -> RabbitMQ -> Notifications Service -> Correo

Medicaments Microfrontend -> Medicaments Service -> PostgreSQL
```

## Organización del proyecto

| Ruta | Contenido |
|---|---|
| `apps/backend/backend/` | Backend principal de SalUD. |
| `apps/backend/notifications/` | Servicio consumidor de eventos y envío de correos. |
| `apps/backend/medicaments-service/` | API del dominio de medicamentos. |
| `apps/frontend/frontend/` | Aplicación web principal. |
| `apps/frontend/medicaments-microfrontend/` | Microfrontend de medicamentos. |
| `infra/` | Archivos de Docker Compose y configuración de infraestructura. |
| `docs/` | Documentación arquitectónica y decisiones técnicas. |

## Feature Flags

El servicio de notificaciones utiliza ConfigCat para seleccionar la plantilla
del correo de una orden mediante la flag `backend_ff`. Esta decisión permite
activar una nueva presentación o volver a la tradicional sin redesplegar el
servicio.

- [Guía de Feature Flags con ConfigCat](docs/feature-flags/README.md)
- [Ficha de la flag de notificaciones](docs/feature-flags/feature-flag-notificaciones.md)
- [ADR - Uso de ConfigCat](docs/feature-flags/adr-feature-flags-configcat.md)
- [Plan de pruebas de la flag](docs/feature-flags/testing-feature-flag-notificaciones.md)

## Documentación relacionada

- [Arquitectura detallada del sistema](docs/README.md)
- [Diagramas](docs/Diagramas/README.md)
- [Comandos de ejecución](comandos.md)
