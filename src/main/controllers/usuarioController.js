function obtenerUsuarios(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM USUARIOS ORDER BY id_usuario DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function agregarUsuario(db, usuarioData) {
    const { nombre_completo, tipo, grado, grupo } = usuarioData;
    return new Promise((resolve, reject) => {
        if (!nombre_completo || !nombre_completo.trim()) {
            return resolve({ success: false, message: 'El nombre es obligatorio' });
        }
        if (tipo !== 'alumno' && tipo !== 'docente') {
            return resolve({ success: false, message: 'El tipo debe ser alumno o docente' });
        }

        const query = `
            INSERT INTO USUARIOS (nombre_completo, tipo, grado, grupo)
            VALUES (?, ?, ?, ?)
        `;
        db.run(query, [nombre_completo.trim(), tipo, grado || null, grupo || null], function(err) {
            if (err) resolve({ success: false, message: err.message });
            else resolve({ success: true, id_usuario: this.lastID });
        });
    });
}

module.exports = { obtenerUsuarios, agregarUsuario };
