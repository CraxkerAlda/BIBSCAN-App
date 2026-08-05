// Registrar Préstamo con validaciones de límite y plazo de 7 días
function registrarPrestamo(db, { codigo_barras, id_usuario }) {
    return new Promise((resolve, reject) => {
        // 1. Validar que el usuario exista y esté activo
        db.get('SELECT * FROM USUARIOS WHERE id_usuario = ? AND activo = 1', [id_usuario], (err, usuario) => {
            if (err) return reject(err);
            if (!usuario) return resolve({ success: false, message: 'El usuario no existe o está inactivo.' });

            // 2. Regla de Negocio: Límite de libros según el tipo de usuario (Alumno: 2, Docente: 5)
            const limiteLibros = usuario.tipo === 'docente' ? 5 : 2;

            db.get(
                'SELECT COUNT(*) as total FROM PRESTAMOS WHERE id_usuario = ? AND estado IN ("activo", "vencido")',
                [id_usuario],
                (err, row) => {
                    if (err) return reject(err);
                    if (row.total >= limiteLibros) {
                        return resolve({ 
                            success: false, 
                            message: `El ${usuario.tipo} ya tiene el límite máximo de ${limiteLibros} libro(s) en préstamo.` 
                        });
                    }

                    // 3. Validar que el libro exista y esté disponible
                    db.get('SELECT * FROM LIBROS WHERE codigo_barras = ?', [codigo_barras], (err, libro) => {
                        if (err) return reject(err);
                        if (!libro) return resolve({ success: false, message: 'Libro no encontrado en el catálogo.' });
                        if (libro.disponible === 0) return resolve({ success: false, message: 'El libro ya se encuentra prestado.' });

                        // 4. Calcular plazo estándar (7 días naturales)
                        const hoy = new Date().toISOString().split('T')[0];
                        const fechaLimiteObj = new Date();
                        fechaLimiteObj.setDate(fechaLimiteObj.getDate() + 7);
                        const fecha_limite = fechaLimiteObj.toISOString().split('T')[0];

                        // 5. Registrar préstamo y actualizar disponibilidad
                        db.serialize(() => {
                            db.run(
                                'INSERT INTO PRESTAMOS (id_libro, id_usuario, fecha_prestamo, fecha_limite, estado) VALUES (?, ?, ?, ?, "activo")',
                                [libro.id_libro, id_usuario, hoy, fecha_limite]
                            );
                            db.run(
                                'UPDATE LIBROS SET disponible = 0 WHERE id_libro = ?',
                                [libro.id_libro],
                                (err) => {
                                    if (err) resolve({ success: false, message: err.message });
                                    else resolve({ 
                                        success: true, 
                                        message: `Préstamo registrado exitosamente por 7 días. Límite de devolución: ${fecha_limite}` 
                                    });
                                }
                            );
                        });
                    });
                }
            );
        });
    });
}

// Renovar / Extender Plazo de Préstamo (Prórroga por 7 días más)
function extenderPrestamo(db, { id_prestamo, dias_extra = 7 }) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM PRESTAMOS WHERE id_prestamo = ? AND estado = "activo"', [id_prestamo], (err, prestamo) => {
            if (err) return reject(err);
            if (!prestamo) return resolve({ success: false, message: 'No se encontró un préstamo activo para renovar.' });

            // Calcular nueva fecha límite sumando los días extra
            const limiteActual = new Date(prestamo.fecha_limite);
            limiteActual.setDate(limiteActual.getDate() + dias_extra);
            const nueva_fecha_limite = limiteActual.toISOString().split('T')[0];

            db.run(
                'UPDATE PRESTAMOS SET fecha_limite = ? WHERE id_prestamo = ?',
                [nueva_fecha_limite, id_prestamo],
                function (err) {
                    if (err) resolve({ success: false, message: err.message });
                    else resolve({ 
                        success: true, 
                        message: `Préstamo extendido correctamente. Nueva fecha límite: ${nueva_fecha_limite}` 
                    });
                }
            );
        });
    });
}

// Registrar Devolución
function registrarDevolucion(db, codigo_barras) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id_libro FROM LIBROS WHERE codigo_barras = ?', [codigo_barras], (err, libro) => {
            if (err) return reject(err);
            if (!libro) return resolve({ success: false, message: 'El libro no existe en el catálogo.' });

            const hoy = new Date().toISOString().split('T')[0];

            db.serialize(() => {
                db.run(
                    'UPDATE PRESTAMOS SET estado = "devuelto", fecha_devolucion = ? WHERE id_libro = ? AND estado IN ("activo", "vencido")',
                    [hoy, libro.id_libro]
                );
                db.run(
                    'UPDATE LIBROS SET disponible = 1 WHERE id_libro = ?',
                    [libro.id_libro],
                    (err) => {
                        if (err) resolve({ success: false, message: err.message });
                        else resolve({ success: true, message: 'Devolución registrada correctamente.' });
                    }
                );
            });
        });
    });
}

// Obtener Préstamos Activos (para consultar atrasos o extender plazos)
function obtenerPrestamosActivos(db) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.id_prestamo, l.titulo, l.codigo_barras, u.nombre_completo as usuario, 
                   p.fecha_prestamo, p.fecha_limite, p.estado
            FROM PRESTAMOS p
            JOIN LIBROS l ON p.id_libro = l.id_libro
            JOIN USUARIOS u ON p.id_usuario = u.id_usuario
            WHERE p.estado IN ('activo', 'vencido')
            ORDER BY p.fecha_limite ASC
        `;
        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = { 
    registrarPrestamo, 
    extenderPrestamo, 
    registrarDevolucion, 
    obtenerPrestamosActivos 
};