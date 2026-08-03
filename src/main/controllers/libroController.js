function obtenerLibros(db) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM LIBROS ORDER BY id_libro DESC', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function agregarLibro(db, libroData) {
    const { codigo_barras, titulo, autor, genero, categoria, editorial, anio_publicacion } = libroData;
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO LIBROS (codigo_barras, titulo, autor, genero, categoria, editorial, anio_publicacion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(query, [codigo_barras, titulo, autor, genero, categoria, editorial, anio_publicacion], function(err) {
            if (err) resolve({ success: false, message: 'El código de barras ya existe.' });
            else resolve({ success: true, id_libro: this.lastID });
        });
    });
}

function editarLibro(db, libroData) {
    const { id_libro, codigo_barras, titulo, autor, genero, categoria, editorial, anio_publicacion } = libroData;
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE LIBROS 
            SET codigo_barras = ?, titulo = ?, autor = ?, genero = ?, categoria = ?, editorial = ?, anio_publicacion = ?
            WHERE id_libro = ?
        `;
        db.run(query, [codigo_barras, titulo, autor, genero, categoria, editorial, anio_publicacion, id_libro], function(err) {
            if (err) resolve({ success: false, message: 'Error al actualizar el libro o código duplicado.' });
            else resolve({ success: true, message: 'Libro actualizado correctamente.' });
        });
    });
}

function eliminarLibro(db, id_libro) {
    return new Promise((resolve, reject) => {
        // Verificar primero si el libro está prestado actualmente
        db.get('SELECT disponible FROM LIBROS WHERE id_libro = ?', [id_libro], (err, libro) => {
            if (err) return reject(err);
            if (!libro) return resolve({ success: false, message: 'El libro no existe.' });
            if (libro.disponible === 0) {
                return resolve({ success: false, message: 'No se puede eliminar un libro que está prestado actualmente.' });
            }

            db.run('DELETE FROM LIBROS WHERE id_libro = ?', [id_libro], function(err) {
                if (err) resolve({ success: false, message: err.message });
                else resolve({ success: true, message: 'Libro eliminado correctamente.' });
            });
        });
    });
}

module.exports = { obtenerLibros, agregarLibro, editarLibro, eliminarLibro };