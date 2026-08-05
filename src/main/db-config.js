const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Crear carpeta data/ si no existe
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Ruta a la base de datos
const dbPath = path.join(dataDir, 'biblioteca.db');

// Conectar/Crear base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error al abrir la base de datos:", err.message);
    } else {
        console.log("Base de datos SQLite conectada exitosamente.");
    }
});

// Inicializar tablas
function initDatabase() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS LIBROS (
                id_libro INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo_barras TEXT UNIQUE NOT NULL,
                titulo TEXT NOT NULL,
                autor TEXT NOT NULL,
                genero TEXT,
                categoria TEXT,
                editorial TEXT,
                anio_publicacion INTEGER,
                disponible INTEGER NOT NULL DEFAULT 1
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS USUARIOS (
                id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_completo TEXT NOT NULL,
                tipo TEXT NOT NULL CHECK(tipo IN ('alumno', 'docente')),
                grado TEXT,
                grupo TEXT,
                activo INTEGER NOT NULL DEFAULT 1
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS PRESTAMOS (
                id_prestamo INTEGER PRIMARY KEY AUTOINCREMENT,
                id_libro INTEGER NOT NULL,
                id_usuario INTEGER NOT NULL,
                fecha_prestamo TEXT NOT NULL,
                fecha_limite TEXT NOT NULL,
                fecha_devolucion TEXT,
                estado TEXT NOT NULL CHECK(estado IN ('activo', 'devuelto', 'vencido')),
                FOREIGN KEY(id_libro) REFERENCES LIBROS(id_libro),
                FOREIGN KEY(id_usuario) REFERENCES USUARIOS(id_usuario)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS SISTEMA_USUARIOS (
                id_operador INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre_usuario TEXT UNIQUE NOT NULL,
                contrasena_hash TEXT NOT NULL,
                rol TEXT NOT NULL CHECK(rol IN ('administrador', 'docente'))
            )
        `);

        // Semilla idempotente: administrador inicial
        const adminHash = bcrypt.hashSync('admin123', 10);
        db.run(
            'INSERT OR IGNORE INTO SISTEMA_USUARIOS (nombre_usuario, contrasena_hash, rol) VALUES (?, ?, ?)',
            ['admin', adminHash, 'administrador']
        );
    });
}

module.exports = { db, initDatabase };