# SalUD 
Proyecto académico - Informática (Especialización en Ingeniería de Software)

## Descripción
**SalUD** es una aplicación para la gestión de una EPS con los siguientes módulos:

1. Gestión de usuarios (roles y permisos)
2. Gestión de citas generales
3. Gestión de historial clínico
4. Gestión de medicamentos

El proyecto será implementado usando 4 arquitecturas:
- Cliente-Servidor
- Basada en eventos
- En capas
- Microservicios

## Estructura del repositorio
- `arquitecturas/` → Implementación y documentación por cada arquitectura
- `shared/` → Branding y recursos compartidos

## Arquitectura actual (en desarrollo)
**Cliente-Servidor**
- Frontend: React
- Backend: Node.js
- Contenedores: Docker
- Despliegue: Azure (Azure for Students)

## Documentación clave
- Contrato API (Word): `arquitecturas/cliente-servidor/docs/`
- Decisiones (ADR): `arquitecturas/cliente-servidor/docs/decisiones/`
- Minutas: `arquitecturas/cliente-servidor/docs/reuniones/`

## Equipo y organización
El trabajo se organiza por Teams en GitHub:
- Backend
- Frontend
- DevOps
- Documentación

## Fechas (Cliente-Servidor)
- **Primer avance:** 7 de marzo de 2026
- **Entrega final:** 14 de marzo de 2026

## Reglas de trabajo (resumen)
- No se trabaja directamente sobre `main`.
- Cada cambio se hace en una rama `feature/<nombre-funcionalidad>`.
- Todo cambio entra por Pull Request (PR).
- Las tareas se gestionan como Issues.
- Las decisiones arquitectónicas se documentan mediante ADR (Architecture Decision Records).
