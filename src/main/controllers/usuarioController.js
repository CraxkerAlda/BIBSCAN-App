function obtenerUsuarios(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM USUARIOS ORDER BY nombre_completo ASC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function agregarUsuario(db, { nombre_completo, tipo, grado, grupo }) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO USUARIOS (nombre_completo, tipo, grado, grupo) VALUES (?, ?, ?, ?)';
        db.run(query, [nombre_completo, tipo, grado, grupo], function(err) {
            if (err) resolve({ success: false, message: err.message });
            else resolve({ success: true, id_usuario: this.lastID });
        });
    });
}

function editarUsuario(db, { id_usuario, nombre_completo, tipo, grado, grupo }) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE USUARIOS 
            SET nombre_completo = ?, tipo = ?, grado = ?, grupo = ? 
            WHERE id_usuario = ?
        `;
        db.run(query, [nombre_completo, tipo, grado, grupo, id_usuario], function(err) {
            if (err) resolve({ success: false, message: err.message });
            else resolve({ success: true, message: 'Usuario actualizado correctamente.' });
        });
    });
}

function cambiarEstadoUsuario(db, { id_usuario, activo }) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE USUARIOS SET activo = ? WHERE id_usuario = ?';
        db.run(query, [activo, id_usuario], function(err) {
            if (err) resolve({ success: false, message: err.message });
            else resolve({ 
                success: true, 
                message: activo === 1 ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.' 
            });
        });
    });
}

module.exports = { obtenerUsuarios, agregarUsuario, editarUsuario, cambiarEstadoUsuario };
