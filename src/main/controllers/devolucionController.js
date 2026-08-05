function devolver(db, codigo_barras) {
    return new Promise((resolve, reject) => {
        // 1. Buscar préstamo activo del libro por su código de barras
        db.get(
            `SELECT p.id_prestamo, p.id_libro
             FROM PRESTAMOS p
             JOIN LIBROS l ON p.id_libro = l.id_libro
             WHERE l.codigo_barras = ? AND p.estado = 'activo'
             ORDER BY p.id_prestamo DESC
             LIMIT 1`,
            [codigo_barras],
            (err, prestamo) => {
                if (err) return reject(err);
                if (!prestamo) return resolve({ success: false, message: 'No hay un préstamo activo para este código de barras' });

                // 2. Fecha de devolución en el mismo formato usado al registrar el préstamo
                const hoy = new Date().toISOString().split('T')[0];

                // 3. Marcar préstamo como devuelto y liberar el libro
                db.serialize(() => {
                    db.run(
                        'UPDATE PRESTAMOS SET fecha_devolucion = ?, estado = "devuelto" WHERE id_prestamo = ?',
                        [hoy, prestamo.id_prestamo]
                    );
                    db.run(
                        'UPDATE LIBROS SET disponible = 1 WHERE id_libro = ?',
                        [prestamo.id_libro],
                        (updateErr) => {
                            if (updateErr) resolve({ success: false, message: updateErr.message });
                            else resolve({ success: true, message: 'Devolución registrada exitosamente' });
                        }
                    );
                });
            }
        );
    });
}

module.exports = { devolver };
