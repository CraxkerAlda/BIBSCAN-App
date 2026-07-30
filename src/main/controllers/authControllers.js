const bcrypt = require('bcryptjs');

function login(db, { usuario, contrasena }) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM SISTEMA_USUARIOS WHERE nombre_usuario = ?', [usuario], async (err, user) => {
            if (err) return reject(err);
            if (!user) return resolve({ success: false, message: 'Usuario no encontrado' });

            const validPass = await bcrypt.compare(contrasena, user.contrasena_hash);
            if (validPass) {
                resolve({ 
                    success: true, 
                    user: { id: user.id_operador, nombre: user.nombre_usuario, rol: user.rol } 
                });
            } else {
                resolve({ success: false, message: 'Contraseña incorrecta' });
            }
        });
    });
}

module.exports = { login };