# SalUD

Proyecto académico – Informática (Especialización en Ingeniería de Software)

---

# 🏥 SalUD

**SalUD** es un proyecto académico desarrollado como parte de la Especialización en Ingeniería de Software, orientado a la simulación de una plataforma de gestión para una EPS.

El objetivo principal es diseñar, implementar y comparar diferentes estilos arquitectónicos aplicados a un mismo dominio de negocio, permitiendo analizar ventajas, desacoplamiento, escalabilidad, mantenibilidad y evolución del sistema.

---

## 📌 Descripción del proyecto

La plataforma **SalUD** busca centralizar procesos relacionados con la gestión de servicios de salud, permitiendo administrar operaciones esenciales dentro de una EPS.

### Funcionalidades principales

* Gestión de usuarios, roles y permisos
* Gestión de citas médicas
* Gestión de órdenes y autorizaciones
* Gestión de historial clínico
* Gestión de medicamentos
* Control de inventario y entrega de medicamentos
* Notificaciones y seguimiento de procesos

---

## 🧩 Arquitecturas implementadas

El proyecto se desarrolla utilizando diferentes enfoques arquitectónicos, permitiendo comparar patrones de diseño y estilos de integración.

| Arquitectura      | Estado           | Descripción                                                      |
| ----------------- | ---------------- | ---------------------------------------------------------------- |
| Cliente–Servidor  | ✅ Finalizada     | Arquitectura tradicional con frontend y backend desacoplados     |
| Basada en Eventos | ✅ Finalizada     | Comunicación asincrónica mediante eventos y mensajería           |
| En Capas          | ✅ Finalizada   | Separación por responsabilidades y lógica organizada por niveles |
| Microservicios    | ✅ Finalizada      | División funcional del sistema en servicios independientes       |

---

## 📂 Estructura del repositorio

```bash
SalUD/
│
├── arquitecturas/
│   ├── cliente-servidor/
│   ├── eventos/
│   ├── capas/
│   └── microservicios/
│
├── shared/
│   ├── branding/
│
└── README.md
```

### Estructura general

* `arquitecturas/` → Código fuente, documentación y entregables por arquitectura
* `shared/` → Recursos reutilizables, branding, diagramas y documentación compartida
* `README.md` → Documento principal del proyecto

---

## 🧱 Tecnologías utilizadas

Dependiendo de la arquitectura, el proyecto utiliza diferentes tecnologías.

### Stack principal

* **Frontend:** React + Vite
* **Backend:** Node.js + Express
* **Base de datos:** PostgreSQL
* **Mensajería:** RabbitMQ
* **Contenedores:** Docker
* **Orquestación local:** Docker Compose
* **Control de versiones:** Git + GitHub
* **Gestión del trabajo:** GitHub Projects (Kanban)
* **Despliegue académico:** Azure for Students

---

## 📖 Documentación

Cada arquitectura contiene su propia documentación técnica.

### Ubicación de documentación

```bash
arquitecturas/<arquitectura>/docs/
```

### Contenido habitual

* Diagramas de arquitectura
* ADR (Architecture Decision Records)
* Minutas de reunión
* Contratos API
* Diagramas UML
* README específico por arquitectura
* Configuración de infraestructura

---

## 👥 Organización del equipo

El trabajo del proyecto se organiza mediante equipos especializados dentro de GitHub.

### Teams

* **Backend** → Desarrollo de lógica de negocio y API
* **Frontend** → Interfaz de usuario y experiencia visual
* **DevOps** → Infraestructura, Docker, despliegue y automatización
* **Documentación** → Diagramas, entregables y documentación técnica

---

## 📅 Cronograma académico

| Arquitectura     | Primer avance | Entrega final |
| ---------------- | ------------- | ------------- |
| Cliente-Servidor | 07 marzo 2026 | 14 marzo 2026 |
| Eventos          | 11 abril 2026 | 18 abril 2026 |
| En Capas         | 09 mayo 2026 | 16 mayo 2026  |
| Microservicios   | 30 mayo 2026  | 30 mayo 2026  |

---

## 🔄 Metodología de trabajo

El equipo adopta una metodología colaborativa basada en:

* **Kanban** para seguimiento de tareas
* **GitHub Projects** para visualización del flujo de trabajo
* **Issues** para asignación de actividades
* **Pull Requests** para control de cambios
* **Revisión entre compañeros** antes de integrar a `main`

---

## 📋 Convenciones del repositorio

### Flujo Git

* No se realizan cambios directamente sobre `main`
* Cada funcionalidad se desarrolla en una rama independiente
* Convención de ramas:

```bash
feature/<nombre-funcionalidad>
```

Ejemplo:

```bash
feature/gestion-medicamentos
feature/evento-orden-creada
```

---

### Pull Requests

Todo cambio debe:

* Tener Issue asociado
* Ser revisado por otro integrante
* Cumplir estándares del equipo
* Mantener consistencia con la arquitectura correspondiente

---

## 🧠 Objetivo académico

Este proyecto busca comparar cómo un mismo sistema puede ser implementado bajo distintos estilos arquitectónicos, permitiendo:

* Analizar ventajas y limitaciones de cada arquitectura
* Comprender el desacoplamiento entre componentes
* Evaluar escalabilidad y mantenibilidad
* Aplicar patrones reales de ingeniería de software
* Fortalecer prácticas colaborativas de desarrollo

---

## 🚀 Repositorio académico

Proyecto desarrollado con fines académicos dentro de la Especialización en Ingeniería de Software.

---

**Equipo SalUD – 2026**

