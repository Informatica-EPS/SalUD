# 📋 Requisitos del Sistema
## 📌 Proyecto: Módulo de Medicamentos

---

# 🧩 Introducción

El presente documento describe los requisitos funcionales y no funcionales correspondientes al módulo de gestión de medicamentos del sistema **SalUD**.  

El objetivo principal del módulo es garantizar la correcta administración del inventario de medicamentos, el control de entregas a pacientes y la trazabilidad completa de los movimientos realizados dentro del sistema.

---

# ✅ Requisitos Funcionales

## RF-01 – Registrar Medicamento

### Descripción
El sistema debe permitir registrar medicamentos con información básica necesaria para su identificación y control.

### Entradas
- Nombre del medicamento
- Presentación
- Concentración
- Unidad

### Resultado esperado
El medicamento debe quedar almacenado en la base de datos y disponible para operaciones posteriores.

### Prioridad
Alta

---

## RF-02 – Asociar Medicamento a Orden

### Descripción
El sistema debe permitir asociar un medicamento específico a una orden médica generada a partir de una cita.

### Entradas
- Orden médica
- Medicamento
- Cantidad formulada

### Resultado esperado
La orden debe quedar relacionada con el medicamento correspondiente.

### Prioridad
Alta

---

## RF-03 – Crear Inventario Inicial

### Descripción
El sistema debe permitir registrar el stock inicial de medicamentos dentro del inventario.

### Entradas
- Medicamento
- Cantidad inicial

### Resultado esperado
El sistema debe crear el registro inicial de inventario.

### Prioridad
Alta

---

## RF-04 – Registrar Movimiento de Inventario

### Descripción
El sistema debe registrar todos los movimientos realizados sobre el inventario.

### Tipos de movimiento
- Entrada
- Salida

### Entradas
- Medicamento
- Tipo de movimiento
- Cantidad
- Observación

### Resultado esperado
El movimiento debe quedar almacenado en el historial del inventario.

### Prioridad
Alta

---

## RF-05 – Actualizar Stock Automáticamente

### Descripción
El sistema debe actualizar automáticamente el stock disponible después de cada movimiento de inventario.

### Resultado esperado
La cantidad disponible debe reflejar el valor actualizado en tiempo real.

### Prioridad
Alta

---

## RF-06 – Entregar Medicamento

### Descripción
El sistema debe permitir registrar la entrega de medicamentos a pacientes autorizados.

### Entradas
- Paciente
- Orden médica
- Medicamento
- Cantidad entregada

### Resultado esperado
La entrega debe quedar registrada y el inventario actualizado.

### Prioridad
Alta

---

## RF-07 – Validar Disponibilidad

### Descripción
Antes de realizar una entrega, el sistema debe validar la disponibilidad del medicamento en inventario.

### Resultado esperado
El sistema debe impedir entregas cuando el stock sea insuficiente.

### Prioridad
Alta

---

## RF-08 – Mostrar Alerta por Stock Agotado

### Descripción
El sistema debe generar alertas cuando el inventario de un medicamento llegue a cero.

### Resultado esperado
El usuario debe visualizar una advertencia de stock agotado.

### Prioridad
Media

---

## RF-09 – Consultar Historial de Movimientos

### Descripción
El sistema debe permitir consultar la trazabilidad de movimientos realizados sobre el inventario.

### Información consultada
- Fecha
- Usuario
- Tipo de movimiento
- Cantidad
- Observaciones

### Resultado esperado
El sistema debe mostrar el historial completo de movimientos asociados a un medicamento.

### Prioridad
Media

---

## RF-10 – Auditoría de Inventario

### Descripción
El sistema debe almacenar información de auditoría para garantizar trazabilidad y control administrativo.

### Información requerida
- Usuario creador
- Usuario actualizador
- Fecha de creación
- Fecha de modificación

### Resultado esperado
Toda modificación realizada sobre el inventario debe quedar registrada.

### Prioridad
Alta

---

## RF-11 – Gestión por Rol de Farmacia

### Descripción
El sistema debe restringir el acceso al módulo de medicamentos únicamente a usuarios autorizados.

### Resultado esperado
Solo usuarios con permisos de farmacia podrán acceder y gestionar medicamentos.

### Prioridad
Alta

---

# 🔒 Requisitos No Funcionales

## RNF-01 – Tiempo de Respuesta

### Descripción
El sistema debe responder las consultas relacionadas con medicamentos en un tiempo inferior a 3 segundos.

### Tipo
Rendimiento

---

## RNF-02 – Integridad del Inventario

### Descripción
El sistema no debe permitir que el stock de medicamentos tome valores negativos.

### Tipo
Integridad de datos

---

## RNF-03 – Trazabilidad

### Descripción
Todos los movimientos realizados sobre el inventario deben quedar registrados para efectos de auditoría y seguimiento.

### Tipo
Auditoría

---

## RNF-04 – Seguridad

### Descripción
Solo usuarios autorizados podrán acceder y gestionar información relacionada con medicamentos e inventario.

### Tipo
Seguridad

---

## RNF-05 – Escalabilidad

### Descripción
La arquitectura del módulo debe permitir futuras extensiones funcionales.

### Tipo
Escalabilidad
