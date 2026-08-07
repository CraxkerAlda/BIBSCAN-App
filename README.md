# BIBSCAN — Sistema de Gestión Bibliotecaria

**BIBSCAN** es una aplicación de escritorio nativa diseñada para la **Escuela Primaria "Benito Juárez"** (CCT: 13DPR0205U) ubicada en Tepeji de Ocampo, Hidalgo. 

El sistema optimiza y automatiza los procesos de inventario de libros, control de usuarios (alumnos/docentes) y circulación (préstamos y devoluciones) utilizando lectores de código de barras USB en un entorno **100% offline** (sin necesidad de conexión a internet).

---

## 🛠️ Tecnologías Utilizadas

* **Entorno de Escritorio:** Electron
* **Entorno de Ejecución:** Node.js
* **Base de Datos:** SQLite 3 (`sqlite3`)
* **Arquitectura de Comunicación:** IPC (Inter-Process Communication) vía `preload.js`
* **Frontend:** HTML5, CSS3 y Vanilla JavaScript (ES6+)
* **Soporte de Hardware:** Lectores de Código de Barras USB (Plug & Play por emulación de teclado)

---

## 📁 Estructura del Proyecto

```text
BIBSCAN-App/
├── src/
│   ├── main/                    # BACKEND (Proceso Main de Electron)
│   │   ├── db-config.js         # Conexión, esquemas e inicialización de SQLite
│   │   ├── main.js              # Creación de ventana y registro de canales IPC
│   │   └── controllers/         # Lógica de negocio
│   │       ├── authController.js       # Autenticación y hash de contraseñas
│   │       ├── libroController.js      # CRUD de catálogo e inventario
│   │       ├── usuarioController.js    # CRUD de alumnos/docentes y estado
│   │       └── prestamoController.js   # Préstamos, prórrogas y devoluciones
│   │
│   ├── renderer/                # FRONTEND (Proceso Renderer)
│   │   ├── views/               # Pantallas e interfaz de usuario (HTML)
│   │   ├── css/                 # Hojas de estilo universales
│   │   └── js/                  # Lógica de cliente y llamadas a window.api
│   │
│   └── preload.js               # Puente de contexto seguro (ContextBridge)
│
├── data/                        # Almacenamiento local de la base de datos (.db)
├── package.json
└── README.md

```

---

## ⚙️ Características y Reglas de Negocio

### 🔑 Autenticación y Control de Acceso

* Soporte para roles de Administrador y Docente.
* Encriptación de contraseñas mediante `bcryptjs`.
* Creación automática de usuario administrador por defecto (`admin` / `admin123`) al iniciar el sistema por primera vez.

### 📚 Gestión del Catálogo de Libros (CRUD)

* Alta, consulta, edición y eliminación de ejemplares.
* Generación e integración con códigos de barras (Code128).
* **Validación de seguridad:** No se permite eliminar libros que se encuentren en préstamo activo.

### 👥 Gestión de Usuarios (Alumnos y Docentes)

* Alta, consulta y edición de datos del alumnado y personal docente.
* Control de estado de usuario (**Activo** / **Inactivo**) para deshabilitar préstamos sin perder el historial escolar.

### 🔄 Circulación y Reglas de Préstamo

* **Plazo Estándar:** Asignación automática de 7 días naturales por préstamo.
* **Prórrogas:** Permite 1 extensión/renovación de plazo por 7 días adicionales.
* **Límite de Ejemplares Simultáneos:**
* **Alumnos:** Máximo 2 libros activos.
* **Docentes:** Máximo 5 libros activos.


* **Devoluciones Rápidas:** Actualización de inventario en tiempo real mediante el escáner USB.

---

## 🔌 Contrato de API Local (`window.api`)

Toda la comunicación entre el Renderer (Frontend) y la Base de Datos se realiza a través de las funciones asíncronas expuestas en `window.api` (`preload.js`):

| Módulo | Función | Descripción |
| --- | --- | --- |
| **Auth** | `window.api.login(creds)` | Valida credenciales de acceso |
| **Libros** | `window.api.obtenerLibros()` | Devuelve el catálogo completo |
|  | `window.api.agregarLibro(data)` | Registra un nuevo libro |
|  | `window.api.editarLibro(data)` | Actualiza un libro existente |
|  | `window.api.eliminarLibro(id)` | Elimina un libro (si no está prestado) |
| **Usuarios** | `window.api.obtenerUsuarios()` | Devuelve alumnos y docentes registrados |
|  | `window.api.agregarUsuario(data)` | Registra un nuevo alumno/docente |
|  | `window.api.editarUsuario(data)` | Actualiza información del usuario |
|  | `window.api.cambiarEstadoUsuario(data)` | Activa o desactiva un usuario |
| **Circulación** | `window.api.obtenerPrestamosActivos()` | Lista los préstamos pendientes |
|  | `window.api.registrarPrestamo(data)` | Valida límites y registra préstamo por 7 días |
|  | `window.api.extenderPrestamo(data)` | Aplica prórroga de 7 días extra |
|  | `window.api.registrarDevolucion(codigo)` | Procesa devolución y libera disponibilidad |

---

## 🚀 Instalación y Ejecución Local

1. Clonar el repositorio:
```bash
git clone [https://github.com/CraxkerAlda/BIBSCAN-App.git](https://github.com/CraxkerAlda/BIBSCAN-App.git)
cd BIBSCAN-App

```


2. Instalar dependencias:
```bash
npm install

```


3. Iniciar la aplicación en entorno de desarrollo:
```bash
npm start

```



---

## 🌿 Flujo de Trabajo en Git (GitFlow Simplificado)

Para garantizar un desarrollo colaborativo ordenado, el proyecto sigue las siguientes reglas:

* **Prohibido** realizar commits directos sobre la rama `main`.
* Cada funcionalidad debe trabajarse en su propia rama descriptiva:
* `feature/backend-crud`
* `feature/reglas-circulacion`
* `feature/frontend-vistas`


* La integración hacia `main` se realiza exclusivamente mediante **Pull Requests (PR)** aprobados en GitHub.
