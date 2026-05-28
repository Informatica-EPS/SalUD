# ADR - Uso de ConfigCat para Feature Flags en el servicio de notificaciones

| Campo | Valor |
|---|---|
| Estado | **Aceptado** |
| Fecha del documento | 2026-05-23 |
| Ámbito | Servicio `notifications-service` |
| Decisión registrada | Uso de ConfigCat para seleccionar la plantilla del correo de orden creada |
| Flag implementada | `backend_ff` |

## Contexto

SalUD dispone de un servicio de notificaciones que consume eventos desde
RabbitMQ y envía correos a los pacientes. Para el evento `order.created`, se
implementaron dos presentaciones del contenido: una plantilla tradicional y
una plantilla renovada.

Los cambios de interfaz en comunicaciones al usuario requieren poder
habilitarse, verificarse y revertirse con rapidez. La implementación revisada
incorpora el SDK `@configcat/sdk` dentro del servicio de notificaciones y
consulta la flag booleana `backend_ff` antes de seleccionar el contenido del
correo.

## Problema

Publicar directamente una nueva plantilla obliga a realizar otro cambio de
código o redespliegue para restaurar la versión anterior si la presentación
falla, confunde al usuario o no cumple criterios de aceptación. Se requiere
controlar la liberación de la plantilla sin interrumpir el procesamiento
normal de órdenes.

## Decisión

Se acepta utilizar **ConfigCat** como proveedor de Feature Flags para el
servicio de notificaciones. La flag `backend_ff` se evaluará en backend durante
el manejo del evento `order.created`:

| Resultado de evaluación | Decisión |
|---|---|
| `true` | Enviar la nueva plantilla de correo. |
| `false` | Enviar la plantilla tradicional. |

La consulta implementada proporciona `false` como valor predeterminado, con el
fin de privilegiar el comportamiento previamente conocido cuando no se
obtenga una habilitación positiva de la nueva plantilla.


## Condiciones operativas

| Condición | Criterio |
|---|---|
| Activación | Pruebas satisfactorias de `backend_ff=false` y `backend_ff=true` en un ambiente controlado. |
| Rollback | Establecer `backend_ff=false` y verificar un nuevo correo de orden. |
| Seguridad | No exponer la SDK key, credenciales ni datos identificables del paciente. |
| Retiro | Eliminar la bifurcación en una versión posterior cuando la plantilla definitiva sea aprobada. |

## Estado

**Aceptado.** La decisión corresponde a la implementación encontrada en el
servicio de notificaciones y queda sujeta a la validación operativa de
variables de entorno y pruebas documentadas.
