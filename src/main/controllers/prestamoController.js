function registrarPrestamo(db, { codigo_barras, id_usuario }) {
    return new Promise((resolve, reject) => {
        // 1. Verificar si el libro existe y está disponible
        db.get('SELECT * FROM LIBROS WHERE codigo_barras = ?', [codigo_barras], (err, libro) => {
            if (err) return reject(err);
            if (!libro) return resolve({ success: false, message: 'Libro no encontrado en el catálogo' });
            if (libro.disponible === 0) return resolve({ success: false, message: 'El libro ya está prestado' });

            // 2. Fechas: Hoy y límite a 7 días
            const hoy = new Date().toISOString().split('T')[0];
            const limite = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // 3. Insertar préstamo y cambiar disponible = 0
            db.serialize(() => {
                db.run(
                    'INSERT INTO PRESTAMOS (id_libro, id_usuario, fecha_prestamo, fecha_limite, estado) VALUES (?, ?, ?, ?, "activo")',
                    [libro.id_libro, id_usuario, hoy, limite]
                );
                db.run(
                    'UPDATE LIBROS SET disponible = 0 WHERE id_libro = ?',
                    [libro.id_libro],
                    (err) => {
                        if (err) resolve({ success: false, message: err.message });
                        else resolve({ success: true, message: 'Préstamo registrado exitosamente' });
                    }
                );
            });
        });
    });
}

module.exports = { registrarPrestamo };