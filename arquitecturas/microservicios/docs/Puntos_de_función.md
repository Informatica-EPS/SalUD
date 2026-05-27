# 📊 Análisis de Puntos de Función (IFPUG)
## 📌 Proyecto: Módulo de Medicamentos – Arquitectura en Capas

---

## 🧩 1. Clasificación de Funciones

Se identificaron las funciones del sistema según la metodología IFPUG, clasificándolas en funciones transaccionales (EI, EO, EQ) y funciones de datos (ILF, EIF).

| ID | Requerimiento | Tipo | Justificación |
|----|--------------|------|--------------|
| RF-01 | Registrar medicamento | EI | Entrada de datos que crea registros persistentes |
| RF-02 | Asociar medicamento a orden | EI | Actualiza relaciones entre entidades |
| RF-03 | Crear inventario inicial | EI | Registro inicial de stock |
| RF-04 | Registrar movimiento inventario | EI | Entrada transaccional |
| RF-05 | Actualizar stock automáticamente | EO | Procesamiento con lógica interna |
| RF-06 | Entregar medicamento | EI | Registro de salida |
| RF-07 | Validar disponibilidad | EQ | Consulta sin modificación |
| RF-08 | Mostrar alerta stock agotado | EO | Salida con lógica |
| RF-09 | Consultar historial de movimientos | EQ | Consulta estructurada |
| RF-10 | Auditoría de inventario | ILF | Datos persistentes |
| RF-11 | Gestión por rol farmacia | EIF | Dependencia de sistema externo |

---

## ⚙️ 2. Determinación de Complejidad

Se evaluó la complejidad de cada función según criterios IFPUG.

| ID | Tipo | Complejidad |
|----|------|------------|
| RF-01 | EI | Media |
| RF-02 | EI | Media |
| RF-03 | EI | Baja |
| RF-04 | EI | Media |
| RF-05 | EO | Media |
| RF-06 | EI | Media |
| RF-07 | EQ | Baja |
| RF-08 | EO | Baja |
| RF-09 | EQ | Media |
| RF-10 | ILF | Media |
| RF-11 | EIF | Baja |

---

## ⚖️ 3. Tabla de Pesos IFPUG

| Tipo | Baja | Media |
|------|------|------|
| EI | 3 | 4 |
| EO | 4 | 5 |
| EQ | 3 | 4 |
| ILF | 7 | 10 |
| EIF | 5 | 7 |

---

## 📊 4. Cálculo de Puntos de Función Sin Ajustar (UFP)

| ID | Tipo | Complejidad | Peso |
|----|------|------------|------|
| RF-01 | EI | Media | 4 |
| RF-02 | EI | Media | 4 |
| RF-03 | EI | Baja | 3 |
| RF-04 | EI | Media | 4 |
| RF-05 | EO | Media | 5 |
| RF-06 | EI | Media | 4 |
| RF-07 | EQ | Baja | 3 |
| RF-08 | EO | Baja | 4 |
| RF-09 | EQ | Media | 4 |
| RF-10 | ILF | Media | 10 |
| RF-11 | EIF | Baja | 5 |

### ✅ Total UFP = **50 Puntos de Función**

---

## 📈 5. Factor de Ajuste del Valor (VAF)

Se evaluaron los 14 factores generales del sistema en una escala de 0 a 5.

| # | Factor | Valor |
|--|--------|------|
| 1 | Comunicación de datos | 3 |
| 2 | Procesamiento distribuido | 2 |
| 3 | Rendimiento | 4 |
| 4 | Configuración intensiva | 2 |
| 5 | Tasa de transacciones | 3 |
| 6 | Entrada de datos online | 4 |
| 7 | Eficiencia del usuario | 3 |
| 8 | Actualización online | 4 |
| 9 | Procesamiento complejo | 3 |
| 10 | Reusabilidad | 2 |
| 11 | Facilidad instalación | 2 |
| 12 | Facilidad operación | 3 |
| 13 | Múltiples sitios | 2 |
| 14 | Facilidad cambio | 3 |

### 🔢 Suma Total: **40**

### 📌 Fórmula:
VAF = 0.65 + (0.01 × ΣFi)

### Resultado:
VAF = 0.65 + (0.01 × 40) = 1.05

---

## 📐 6. Puntos de Función Ajustados (AFP)
AFP = UFP × VAF

AFP = 50 × 1.05 = 52.5 ≈ 53 PF

---

## ⏱️ 7. Estimación de Esfuerzo

Se considera una productividad de **8 horas por punto de función** (lenguaje de cuarta generación).

Esfuerzo total = 53 × 8 = 424 horas

---

## 👥 8. Estimación de Tiempo del Proyecto

Equipo: **8 personas**

Tiempo total = 424 / 8 = 53 horas


### 📅 Estimación en semanas

Asumiendo 14 horas por semana por persona:

Duración = 53 / 14 = 3.78 ≈ 4 semanas

---

## 🎯 9. Resultados Finales

- **UFP:** 50  
- **VAF:** 1.05  
- **AFP:** 53 Puntos de Función  
- **Esfuerzo total:** 424 horas  
- **Duración estimada:** 4 semanas (equipo de 8 personas)

---

## 📚 Referencia

International Function Point Users Group (IFPUG) – Function Point Counting Practices Manual.

---


