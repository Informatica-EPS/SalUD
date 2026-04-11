# Suite Mínima de Pruebas Backend – SalUD / Cliente-Servidor

## 1. Objetivo
Definir el conjunto mínimo de pruebas backend para cubrir los flujos críticos y reducir regresiones.

## 2. Alcance
Pruebas unitarias y de integración sobre servicios y rutas críticas. No incluye E2E.

## 3. Supuestos
- Existe un entorno de prueba con base de datos aislada.
- Hay datos seed mínimos o factories para crear registros de prueba.

## 4. Pruebas unitarias mínimas
- appointments service: crear cita con datos válidos.
- appointments service: validar errores por datos faltantes.
- appointments service: reagendar cita a horario disponible.
- appointments service: cancelar cita.

- time-slots service: listar disponibles.
- time-slots service: marcar horario como ocupado.

- patients service: obtener paciente por id válido.
- patients service: error con id inexistente.

## 5. Pruebas de integración mínimas
- POST /api/appointments crea cita y persiste en DB.
- PUT /api/appointments/reschedule/:id actualiza horario.
- PUT /api/appointments/cancel/:id actualiza estado.
- GET /api/appointments/doctor/:id retorna citas del doctor.
- GET /api/appointments/paciente/:id retorna citas del paciente.

- GET /api/time-slots/available retorna horarios disponibles.
- GET /api/time-slots/doctor/:id retorna horarios del doctor.

- GET /api/patients retorna lista.
- GET /api/patients/:id retorna un paciente.

## 6. Prioridad
- P1: appointments (crear, reagendar, cancelar) y horarios disponibles.
- P2: patients y listados.

## 7. Criterios de aceptación
- Todas las pruebas definidas pasan.
- No hay fallos en flujos críticos.

## 8. Evidencia
- Reporte de ejecución de tests.
- Resultados de cobertura cuando aplique.
