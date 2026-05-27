# 📊 Archivos Draw.io - Cómo Usar

En la carpeta `docs/` encontrarás **3 diagramas en formato draw.io** que puedes importar y editar:

## 📁 Archivos Disponibles

### 1. **desarrollo-vs-produccion.drawio** 
- **Propósito:** Comparativa lado a lado
- **Contenido:** DESARROLLO (izquierda) vs PRODUCCIÓN (derecha)
- **Mejor para:** Presentaciones, entender diferencias de alto nivel

### 2. **desarrollo-detallado.drawio**
- **Propósito:** Detalles completos del ambiente local
- **Contenido:** 
  - Nivel 1: Aplicaciones (Frontend, Backend, Medicamentos)
  - Nivel 2: Micro-Frontend, Workers, Brokers
  - Nivel 3: Bases de datos
  - Nivel 4: Volúmenes
  - Network Docker
- **Mejor para:** Documentación técnica, onboarding

### 3. **produccion-detallado.drawio**
- **Propósito:** Detalles completos del despliegue Azure
- **Contenido:**
  - Sección 1: Azure VM (Monolito)
  - Sección 2: Azure Static Apps (MF)
  - Sección 3: Container Apps (Serverless)
  - Sección 4: Neon.tech (BD Serverless)
  - Sección 5: Servicios compartidos
  - Sección 6: CI/CD Pipeline
- **Mejor para:** Documentación de infraestructura

---

## 🚀 Cómo Importar en Draw.io

### **Opción 1: Online (Recomendado)**

1. Abre https://www.draw.io/
2. Selecciona **File → Open**
3. Busca el archivo `.drawio` en tu computadora
4. ¡Listo! Puedes editar y compartir

### **Opción 2: Localmente (Draw.io Desktop)**

1. Descarga [Draw.io Desktop](https://github.com/jgraph/drawio-desktop/releases)
2. Instala en tu máquina
3. Abre el archivo `.drawio` con Draw.io Desktop
4. Edita sin conexión a internet

### **Opción 3: VS Code (con extensión)**

1. Instala extensión: **Draw.io Integration** en VS Code
2. Click derecho en archivo `.drawio` → **Open with Draw.io**
3. Edita dentro de VS Code

---

## ✏️ Cómo Editar

Una vez abierto el archivo:

**Para cambiar colores:**
- Selecciona forma → Click derecho → **Style** → **Fill Color**

**Para cambiar texto:**
- Doble-click en elemento → Edita texto

**Para agregar elementos:**
- Arrastra desde panel izquierdo

**Para cambiar puertos:**
- Edita las etiquetas `:5000`, `:8080`, etc.

---

## 📤 Cómo Exportar

Si necesitas PNG o PDF:

1. Selecciona **File → Export**
2. Elige formato:
   - **PNG** (para web)
   - **PDF** (para documentos)
   - **SVG** (para escalable)
3. Descarga

---

## 💡 Casos de Uso

### Documentación de API
→ Usa **desarrollo-detallado.drawio** + **produccion-detallado.drawio**

### Presentación a stakeholders
→ Usa **desarrollo-vs-produccion.drawio**

### Onboarding de nuevos devs
→ Usa **desarrollo-detallado.drawio**

### Planificación de despliegue
→ Usa **produccion-detallado.drawio**

---

## 🔄 Sincronización con Git

Si quieres versionar tus cambios:

```bash
git add arquitecturas/microservicios/docs/*.drawio
git commit -m "docs: update architecture diagrams"
git push origin feature/#125
```

Draw.io genera archivos XML, así que Git puede trackear cambios.

---

## 📌 Colores Utilizados

| Color | Significado | Componentes |
|-------|-------------|------------|
| 🔵 Azul | Frontend, Cliente | React, UI |
| 🟢 Verde | Backend, Lógica | Node.js, Express |
| 🟣 Púrpura | Servicios especiales | Python, FastAPI, Medicamentos |
| 🟡 Amarillo | Message Brokers | RabbitMQ |
| 🔴 Rojo | Notificaciones | Email, alertas |
| ⚫ Gris | Infraestructura | Docker, Volúmenes |

---

## 🆘 Troubleshooting

**"No se abre el archivo"**
→ Descarga draw.io desktop desde github

**"No puedo editar en VS Code"**
→ Instala extensión "Draw.io Integration"

**"Quiero compartir el diagrama online"**
→ Abre en draw.io → File → Share → obtén link público

---

**¡Listos para usar!** Descarga los archivos y comienza a editar. 🎉
