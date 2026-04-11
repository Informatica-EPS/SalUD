# Plan QA v1.0 – SalUD / Cliente-Servidor

## 1. Objetivo
Asegurar estabilidad funcional, calidad técnica y confiabilidad del sistema frontend, backend y API antes de entregas parciales y finales.

## 2. Tipos de prueba
- Unitarias: lógica de servicios y utilidades.
- Integración: API + DB + servicios.
- E2E automatizados: no se incluyen en este alcance.
- No funcionales básicas: validación de errores, tiempos de respuesta básicos, disponibilidad del `/health`.

## 3. Herramientas
- Frontend: Jest + Testing Library ya configurados.
- Backend: Jest o Supertest, a definir si no están configurados.
- API manual/contract: Postman collection.
- CI: pipeline básico se incluye en este alcance.

## 4. Criterios de calidad iniciales
- Lint sin errores.
- Tests automatizados pasan en frontend y backend.
- Cobertura mínima inicial: 50% en módulos críticos.
- Sin fallos en flujos críticos definidos.

## 5. Flujos críticos mínimos
- Registro de usuario.
- Login.
- Crear cita.
- Reagendar/cancelar cita.
- Consulta de historial clínico.

## 6. Entregables
- Documento Plan QA, este.
- Checklist de release.
- Suite de pruebas automatizadas mínima.
- Reporte de cobertura.
- Pipeline CI básico.

## 7. Frecuencia
- Cada PR: lint + tests.
- Cada hito: smoke test manual sin automatización E2E.

## 8. Riesgos
- Falta de datos seed.
- Dependencias Docker con errores.
- Cobertura insuficiente en backend.
