# Feature Flag de plantilla de correo del servicio de notificaciones

## Ficha de identificación

| Campo | Valor |
|---|---|
| Nombre real de la flag | `backend_ff` |
| Servicio afectado | `notifications-service` |
| Proveedor | ConfigCat |
| Tipo | **Release Toggle** |
| Evento al que aplica | `order.created` |
| Valor predeterminado en la consulta | `false` |
| Estado actual | Implementada en código; activación por ambiente sujeta a la configuración de ConfigCat y de `CONFIG_CAT_KEY`. |
| Responsable | Ingeniero Andres Ariza - Team Backend |
| Fecha de creación de la flag | 2026-05-25 |
| Fecha de elaboración de esta ficha | 2026-05-26 |

## Clasificación

La flag se clasifica como **Release Toggle** porque permite liberar o retirar
una nueva plantilla de correo sin redesplegar la aplicación. 

## Objetivo

Permitir que el servicio de notificaciones seleccione en tiempo de ejecución
la versión tradicional o la versión renovada del correo enviado a un paciente
al crearse una orden médica.

## Alcance

| Incluye |
|---|
| Consulta de `backend_ff` al procesar `order.created`. |
| Elección del cuerpo HTML del mensaje de orden creada. | 
| Uso de ConfigCat desde el backend de notificaciones. | 
| Envío mediante el servicio de correo ya existente. | 

## Comportamiento

| Estado | Valor evaluado | Plantilla seleccionada | Resultado visible |
|---|---:|---|---|
| ON | `true` | `alternativeBodyMessage` | Correo renovado con encabezado de orden lista, resumen ampliado y recordatorio de vencimiento. |
| OFF | `false` | `bodyMesagge` | Correo tradicional con detalles básicos de la orden y mensaje de agradecimiento. |

El asunto y los destinatarios se forman fuera de la condición; la flag
selecciona únicamente el contenido HTML del correo.

## Flujo técnico

1. El backend principal crea una orden asociada a especialidad y publica el
   evento `order.created` en el exchange `clinic_events`.
2. `notifications-service` consume el evento desde la cola
   `notifications_service_queue`.
3. El handler `handleOrderCreated` consulta
   `getValueAsync("backend_ff", false)` mediante el cliente ConfigCat.
4. El consumidor obtiene la información de la cita para determinar el nombre
   y correo del paciente.
5. El consumidor construye `bodyMesagge` y `alternativeBodyMessage`.
6. Si el resultado de la flag es `true`, envía la plantilla alternativa; si es
   `false`, envía la tradicional.
7. `NotificationsService` delega en `EmailService`, que remite el contenido
   como HTML mediante Nodemailer.


## Variables de entorno necesarias

| Variable | Obligatoriedad para este flujo | Uso |
|---|---|---|
| `CONFIG_CAT_KEY` | Requerida para evaluación remota normal de la flag | Identifica el ambiente/configuración de ConfigCat para el SDK. |
| `RABBITMQ_URL` | Requerida para consumir el evento en despliegue | Permite recibir `order.created`. |

## Plan de rollback

| Orden | Acción | Resultado esperado |
|---:|---|---|
| 1 | Cambiar `backend_ff` a `false` en ConfigCat para el ambiente afectado. | Nuevos eventos seleccionan la plantilla tradicional después de la actualización del cliente. |
| 2 | Generar una orden controlada de verificación. | Se confirma recepción de la plantilla tradicional. |
| 3 | Revisar logs del consumidor y evidencia del correo. | Se confirma que la evaluación fue `false` y el envío fue procesado. |
| 4 | Registrar incidente, hora del cambio y alcance. | Queda trazabilidad del rollback operativo. |
| 5 | Mantener la nueva plantilla desactivada hasta corregir y probar la causa. | Se evita reexposición prematura del comportamiento cuestionado. |

Este rollback no requiere despliegue de código mientras la versión desplegada
conserve ambas plantillas y pueda evaluar la flag.

## Criterios de cierre de la flag

La flag debe revisarse cuando la nueva plantilla haya sido aprobada y estable
en todos los ambientes pertinentes. El cierre requiere decidir entre hacer
permanente la nueva versión o abandonarla, retirar la bifurcación de código en
una entrega posterior y archivar la configuración de ConfigCat.
