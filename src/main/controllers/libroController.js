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

module.exports = { obtenerLibros, agregarLibro };