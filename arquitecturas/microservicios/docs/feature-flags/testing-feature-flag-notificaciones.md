# Plan de pruebas - Feature Flag de notificaciones con ConfigCat

## Objetivo

Validar que la flag `backend_ff` selecciona correctamente la plantilla de
correo enviada por `notifications-service` para el evento `order.created`, y
documentar el comportamiento ante fallas de configuración o disponibilidad de
ConfigCat.

## Base verificada de la prueba

| Elemento | Valor identificado |
|---|---|
| Flag | `backend_ff` |
| Consulta implementada | `getValueAsync("backend_ff", false)` |
| Evento detonante | `order.created` |
| Cola consumida | `notifications_service_queue` |
| Servicio bajo prueba | `notifications-service` |
| Plantilla OFF | `bodyMesagge` |
| Plantilla ON | `alternativeBodyMessage` |

## Precondiciones

| Id | Precondición |
|---|---|
| P-01 | El backend, RabbitMQ y `notifications-service` se encuentran iniciados. |
| P-02 | Existe una cita y datos válidos para crear una orden médica asociada a especialidad. |
| P-03 | El destinatario de prueba puede revisar el correo recibido. |
| P-04 | El probador dispone de permisos para cambiar `backend_ff` en ConfigCat. |
| P-05 | Para pruebas normales ON/OFF, `CONFIG_CAT_KEY` está disponible en el ambiente del servicio. |
| P-06 | Las evidencias ocultan claves, credenciales y datos personales innecesarios. |

La ruta funcional identificada que puede originar el evento es la creación de
una orden en el backend (`POST /api/orders`), siempre que la orden corresponda
a una especialidad y cumpla las precondiciones de datos del ambiente.

## Casos de prueba - flag ON

| Id | Escenario | Procedimiento | Resultado esperado | Evidencia |
|---|---|---|---|---|
| ON-01 | Envío con plantilla renovada | Configurar `backend_ff=true`; esperar la actualización de ConfigCat; crear una orden médica válida. | Se recibe un correo cuyo contenido corresponde a la plantilla renovada de orden lista y resumen ampliado. | Correo recibido.|
| ON-02 | Conservación de datos funcionales | Comparar el correo ON con los datos de la orden generada. | El asunto, especialidad, descripción y fecha corresponden a la orden; solo cambia la presentación elegida por la flag. | Correo y referencia sanitizada de la orden. |

## Casos de prueba - flag OFF

| Id | Escenario | Procedimiento | Resultado esperado | Evidencia |
|---|---|---|---|---|
| OFF-01 | Envío con plantilla tradicional | Configurar `backend_ff=false`; esperar la actualización; crear una nueva orden válida. | Se recibe el correo con el contenido tradicional de orden creada. | Correo recibido. |
| OFF-02 | Rollback operativo | Después de ON-01, cambiar la flag a OFF y crear otra orden válida. | La siguiente notificación utiliza la plantilla tradicional sin reconstruir ni redesplegar el contenedor. | Secuencia de estados y dos correos comparativos. |


## Evidencias 

| Evidencia | Contenido mínimo |
|---|---|
| E-01 - Correo OFF | Vista de la plantilla tradicional y fecha de prueba. |
| E-02 - Correo ON | Vista de la plantilla renovada y fecha de prueba. |

