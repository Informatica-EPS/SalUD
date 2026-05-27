# 🏗️ Arquitectura de Microservicios - SalUD

**Rama:** `feature/#125`  
**Estado:** En Desarrollo  
**Fecha:** Mayo 2026

---

## 📋 Tabla de Contenidos
1. [Diagrama General](#diagrama-general)
2. [Componentes](#componentes)
3. [Feature Flags](#feature-flags)
4. [Flujos de Eventos](#flujos-de-eventos)
5. [Despliegue](#despliegue)

---

## 🎨 Diagrama General

```mermaid
graph TB
    subgraph Azure["☁️ Azure Cloud"]
        subgraph Frontend["🖥️ FRONTEND LAYER"]
            FE[Frontend Principal<br/>React + Vite<br/>Puerto 8080]
            MFE[Medicaments Micro-Frontend<br/>React + Vite + Module Federation<br/>Puerto 8081]
        end

        subgraph APIGateway["🚪 API GATEWAY"]
            Backend[Backend Principal<br/>Node.js + Express<br/>Puerto 5000<br/>- REST API<br/>- Swagger Docs<br/>- RabbitMQ Publisher]
        end

        subgraph Microservices["🔧 MICROSERVICIOS"]
            NotifService[Notifications Service<br/>Node.js + Express<br/>Puerto 5001<br/>- RabbitMQ Consumer<br/>- Nodemailer<br/>- Event Handler]
            
            MedicService[Medicaments Service<br/>Python + FastAPI<br/>Puerto 5010<br/>- CRUD Medicamentos<br/>- Inventory Management<br/>- Movement Tracking]
        end

        subgraph MessageBroker["📬 EVENT BUS"]
            RabbitMQ[RabbitMQ<br/>Puerto 5672 AMQP<br/>Puerto 15672 UI<br/>Exchange: clinic_events<br/>Tipo: topic]
        end

        subgraph Databases["🗄️ BASES DE DATOS"]
            PG1[(PostgreSQL Principal<br/>mi_base_de_datos<br/>Puerto 5432<br/>- users<br/>- patients<br/>- doctors<br/>- appointments<br/>- orders<br/>- time_slots<br/>- specialties)]
            
            PG2[(PostgreSQL Medicamentos<br/>medicaments_db<br/>Puerto 5433<br/>- medicamentos<br/>- inventario<br/>- movimientos)]
            
            PgAdmin[PgAdmin<br/>Puerto 5050<br/>Visual Admin]
        end
    end

    subgraph FeatureFlags["⚙️ FEATURE FLAGS"]
        FF1["🚀 Orders.Creation<br/>- Enabled by default<br/>- Controls order creation flow"]
        FF2["📧 Notifications.Email<br/>- Enabled by default<br/>- Enable/Disable email notifications"]
        FF3["💊 Medicaments.NewUI<br/>- Disabled by default<br/>- Toggle new medicaments interface"]
        FF4["🔐 Users.TwoFactor<br/>- Disabled by default<br/>- Enable 2FA for users"]
    end

    %% Conexiones Frontend a Backend
    FE -->|REST API| Backend
    FE -->|FeatureFlag: Medicaments.NewUI| MFE
    
    MFE -->|REST API| MedicService
    MFE -->|FeatureFlag: View| FE

    %% Backend a Servicios
    Backend -->|REST API| MedicService
    Backend -->|Publish Events| RabbitMQ

    %% Notifications Service
    RabbitMQ -->|Subscribe order.created| NotifService
    RabbitMQ -->|Subscribe user.registered| NotifService
    RabbitMQ -->|Subscribe appointment.canceled| NotifService
    NotifService -->|Email| Backend

    %% Database Connections
    Backend -->|CRUD| PG1
    NotifService -->|Read| PG1
    MedicService -->|CRUD| PG2
    PgAdmin -->|Manage| PG1
    PgAdmin -->|Manage| PG2

    %% Feature Flags Integration
    Backend -.->|Check| FF1
    NotifService -.->|Check| FF2
    FE -.->|Check| FF3
    Backend -.->|Check| FF4

    style Azure fill:#e3f2fd
    style Frontend fill:#f3e5f5
    style APIGateway fill:#fff3e0
    style Microservices fill:#f1f8e9
    style MessageBroker fill:#fce4ec
    style Databases fill:#e0f2f1
    style FeatureFlags fill:#fffde7
```

---

## 📦 Componentes

### **Capa de Presentación** 🖥️

| Componente | Tecnología | Puerto | Responsabilidad |
|---|---|---|---|
| **Frontend Principal** | React + Vite | 8080 | UI principal, gestión de citas, usuarios, órdenes |
| **Medicaments MFE** | React + Vite + Module Federation | 8081 | Micro-frontend independiente para medicamentos |

---

### **Capa de Negocio (API Gateway)** 🚪

| Componente | Tecnología | Puerto | Responsabilidad |
|---|---|---|---|
| **Backend Principal** | Node.js + Express | 5000 | Orquesta toda la lógica: citas, usuarios, órdenes, especialidades; publica eventos |

**Endpoints Principales:**
```
POST   /api/users/login                              (Autenticación)
GET    /api/patients                                 (Listar pacientes)
GET    /api/doctors                                  (Listar doctores)
POST   /api/appointments                             (Crear cita)
PUT    /api/appointments/:id/cancel                  (Cancelar cita)
POST   /api/appointments/:id/complete                (Completar cita)
POST   /api/appointment-details                      (Registrar diagnóstico)
GET    /api/time-slots/available                     (Horarios disponibles)
POST   /api/orders                                   (Crear orden/autorización)
GET    /api/specialties                              (Especialidades médicas)
GET    /api-docs                                     (Swagger documentation)
```

---

### **Capa de Microservicios** 🔧

#### **1. Notifications Service**
| Aspecto | Detalle |
|---|---|
| **Tecnología** | Node.js + Express |
| **Puerto** | 5001 |
| **Función** | Consumir eventos y enviar notificaciones por email |
| **Eventos que consume** | `order.created`, `user.registered`, `appointment.canceled` |
| **Dependencia** | RabbitMQ + Nodemailer |

#### **2. Medicaments Service**
| Aspecto | Detalle |
|---|---|
| **Tecnología** | Python + FastAPI |
| **Puerto** | 5010 |
| **Función** | Gestión completa de medicamentos e inventario |
| **Endpoints** | `GET /api/medicaments`, `POST /api/medicaments/dispatch` |
| **BD** | PostgreSQL separada: `medicaments_db` (puerto 5433) |
| **ORM** | SQLAlchemy + Alembic (migraciones) |

---

### **Event Bus** 📬

| Componente | Detalle |
|---|---|
| **Broker** | RabbitMQ 3.13 |
| **Puerto AMQP** | 5672 |
| **Puerto UI** | 15672 (admin/admin123) |
| **Exchange** | `clinic_events` (tipo: topic, durable) |
| **Estrategia** | Pub/Sub pattern |
| **Eventos** | `order.created`, `user.registered`, `appointment.canceled`, `appointment.rescheduled` |

---

### **Bases de Datos** 🗄️

#### **PostgreSQL Principal**
```
Host: localhost:5432
Base de datos: mi_base_de_datos
Usuario: user_admin
Contraseña: super_password_123

Tablas:
├── users (Usuarios: pacientes y doctores)
├── patients (Extensión de users)
├── doctors (Extensión de users)
├── appointments (Citas médicas)
├── appointment_details (Diagnósticos, planes)
├── time_slots (Horarios disponibles)
├── orders (Órdenes médicas)
├── specialties (Especialidades)
├── roles (Roles de usuario)
└── role_user (Asociación roles-usuarios)
```

#### **PostgreSQL Medicamentos**
```
Host: localhost:5433
Base de datos: medicaments_db
Usuario: user_admin
Contraseña: super_password_123

Tablas:
├── medicamentos (Catálogo de medicamentos)
├── inventario (Stock actual)
└── movimientos (Historial de entradas/salidas)
```

#### **PgAdmin**
```
URL: http://localhost:5050
Usuario: admin@admin.com
Contraseña: admin
```

---

## 🚀 Feature Flags

Los feature flags permiten habilitar/deshabilitar funcionalidades sin despliegue.

### **Implementación**

```javascript
// backend/src/config/featureFlags.js
const FEATURE_FLAGS = {
  // Crear órdenes médicas
  'orders.creation': {
    enabled: true,
    description: 'Permite crear órdenes médicas'
  },
  
  // Notificaciones por email
  'notifications.email': {
    enabled: true,
    description: 'Envía notificaciones por email'
  },
  
  // Nueva interfaz de medicamentos
  'medicaments.newUI': {
    enabled: false,
    description: 'Activa micro-frontend de medicamentos v2'
  },
  
  // Autenticación de dos factores
  'users.twoFactor': {
    enabled: false,
    description: 'Habilita autenticación de dos factores'
  },
  
  // API Gateway para medicamentos
  'medicaments.gateway': {
    enabled: true,
    description: 'Enruta medicamentos a través de backend'
  },
  
  // Eventos asincronos
  'events.async': {
    enabled: true,
    description: 'Procesa eventos asincronamente'
  }
};

module.exports = FEATURE_FLAGS;
```

### **Uso en Código**

```javascript
// Backend
const { isFeatureEnabled } = require('./services/featureFlagService');

if (isFeatureEnabled('orders.creation')) {
  // Crear orden
  const order = await orderService.create(data);
}

if (isFeatureEnabled('notifications.email')) {
  // Enviar notificación
  await notificationService.sendEmail(user);
}
```

```javascript
// Frontend React
import { useFeatureFlag } from './hooks/useFeatureFlag';

function App() {
  const showMedicamentsUI = useFeatureFlag('medicaments.newUI');
  
  return (
    <>
      {showMedicamentsUI ? (
        <MedicamentsMicroFrontend />
      ) : (
        <LegacyMedicamentsView />
      )}
    </>
  );
}
```

### **Configuración en Docker**

```yaml
# infra/docker-compose.dev.yaml
environment:
  - FEATURE_FLAGS_ENABLED=orders.creation,notifications.email,medicaments.gateway,events.async
  - FEATURE_FLAGS_DISABLED=medicaments.newUI,users.twoFactor
```

---

## 📡 Flujos de Eventos

### **Flujo 1: Creación de Orden**

```mermaid
sequenceDiagram
    participant Client as 👨‍⚕️ Médico
    participant Frontend as 🖥️ Frontend
    participant Backend as ⚙️ Backend
    participant DB as 🗄️ PostgreSQL
    participant RabbitMQ as 📬 RabbitMQ
    participant NotifService as 📧 Notifications
    participant Email as 📨 SMTP

    Client->>Frontend: POST crear orden
    Frontend->>Backend: POST /api/orders
    Backend->>DB: INSERT order
    DB-->>Backend: ✓ Order creada
    Backend->>RabbitMQ: Publish event: order.created
    RabbitMQ-->>NotifService: Consume event
    NotifService->>Email: Send email al paciente
    Email-->>Client: 📨 Email recibido
    Backend-->>Frontend: 200 OK
    Frontend-->>Client: ✓ Orden confirmada
```

### **Flujo 2: Registro de Usuario**

```mermaid
sequenceDiagram
    participant User as 👤 Usuario
    participant Frontend as 🖥️ Frontend
    participant Backend as ⚙️ Backend
    participant DB as 🗄️ PostgreSQL
    participant RabbitMQ as 📬 RabbitMQ
    participant NotifService as 📧 Notifications

    User->>Frontend: Registrarse
    Frontend->>Backend: POST /api/users
    Backend->>DB: CREATE user + patient
    DB-->>Backend: ✓ Usuario creado
    Backend->>RabbitMQ: Publish: user.registered
    RabbitMQ-->>NotifService: Consume event
    NotifService-->>User: 📧 Email bienvenida
    Backend-->>Frontend: 201 Created
    Frontend-->>User: ✓ Registrado exitosamente
```

### **Flujo 3: Gestión de Medicamentos**

```mermaid
sequenceDiagram
    participant Frontend as 🖥️ Medicaments MFE
    participant MedicService as 💊 FastAPI Service
    participant DB as 🗄️ PostgreSQL Medicamentos
    
    Frontend->>MedicService: GET /api/medicaments
    MedicService->>DB: SELECT * FROM medicamentos
    DB-->>MedicService: Lista de medicamentos
    MedicService-->>Frontend: 200 JSON array
    
    Frontend->>MedicService: POST /api/medicaments/dispatch
    MedicService->>DB: UPDATE inventario
    MedicService->>DB: INSERT movimiento
    DB-->>MedicService: ✓ Actualizado
    MedicService-->>Frontend: 201 Created
```

---

## 🛠️ Stack Tecnológico

### **Backend Principal**
- Node.js + Express.js
- Sequelize ORM
- PostgreSQL 15
- RabbitMQ (amqplib)
- Nodemailer
- Swagger/OpenAPI
- Jest + Supertest (testing)
- Bcryptjs (hashing de contraseñas)

### **Microservicio Medicamentos**
- Python 3.9+
- FastAPI
- SQLAlchemy ORM
- Alembic (DB migrations)
- Pydantic (data validation)
- Pytest

### **Frontends**
- React 18+
- Vite (bundler)
- TypeScript
- Module Federation (micro-frontend)
- Axios (HTTP client)

### **Infraestructura**
- Docker + Docker Compose
- PostgreSQL 15
- RabbitMQ 3.13
- PgAdmin 4

---

## 🚀 Despliegue

### **Desarrollo Local**

```bash
cd arquitecturas/microservicios/infra

# Opción 1: Con variables de entorno
docker compose --env-file dev.env -f docker-compose.dev.yaml up -d --build

# Opción 2: Simple
docker compose -f docker-compose.dev.yaml up -d --build
```

### **URLs de Acceso (Local)**

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Medicaments MFE | http://localhost:8081 |
| Backend API | http://localhost:5000 |
| API Docs (Swagger) | http://localhost:5000/api-docs |
| RabbitMQ Management | http://localhost:15672 |
| PgAdmin | http://localhost:5050 |

### **Producción (Azure)**

- **Frontend Principal:** Azure Static Apps
- **Backend + Servicios:** Azure Container Apps
- **Bases de datos:** Azure Database for PostgreSQL
- **Message Broker:** Azure Service Bus o RabbitMQ en Container

---

## 📊 Comparación con Arquitecturas Anteriores

| Característica | Cliente-Servidor | Eventos | Capas | **Microservicios** |
|---|---|---|---|---|
| **Servicios independientes** | ❌ | ❌ | ❌ | ✅ |
| **Escalabilidad** | Limitada | Media | Media | ✅ Alta |
| **Desacoplamiento** | Bajo | Alto | Medio | ✅ Muy alto |
| **Complejidad operacional** | Baja | Media | Media | ✅ Alta |
| **Múltiples BDs** | ❌ | ❌ | ✅ | ✅ |
| **Event-driven** | ❌ | ✅ | Parcial | ✅ |
| **Comunicación sync** | REST | REST | REST | ✅ REST + Async |
| **Lenguajes heterogéneos** | ❌ | ❌ | ❌ | ✅ (Node.js + Python) |

---

## 📝 Notas

- **Feature Flags:** Los feature flags se pueden configurar dinámicamente sin redeploy
- **RabbitMQ:** Es crítico para el desacoplamiento de servicios
- **Scaling:** Cada microservicio puede escalarse independientemente
- **Monitoreo:** Se recomienda implementar Prometheus + Grafana para observabilidad

---

**Última actualización:** Mayo 24, 2026  
**Rama:** feature/#125  
**Responsable:** Equipo SalUD
