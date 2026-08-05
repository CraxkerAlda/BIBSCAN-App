const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Autenticación
    login: (creds) => ipcRenderer.invoke('auth:login', creds),
    
    // Libros (CRUD)
    obtenerLibros: () => ipcRenderer.invoke('libros:obtenerTodos'),
    agregarLibro: (data) => ipcRenderer.invoke('libros:agregar', data),
    editarLibro: (data) => ipcRenderer.invoke('libros:editar', data),
    eliminarLibro: (id) => ipcRenderer.invoke('libros:eliminar', id),
    
    // Usuarios (Alumnos/Docentes)
    obtenerUsuarios: () => ipcRenderer.invoke('usuarios:obtenerTodos'),
    agregarUsuario: (data) => ipcRenderer.invoke('usuarios:agregar', data),
    editarUsuario: (data) => ipcRenderer.invoke('usuarios:editar', data),
    cambiarEstadoUsuario: (data) => ipcRenderer.invoke('usuarios:cambiarEstado', data),

    // Circulación
    obtenerPrestamosActivos: () => ipcRenderer.invoke('prestamos:obtenerActivos'),
    registrarPrestamo: (data) => ipcRenderer.invoke('prestamos:registrar', data),
    extenderPrestamo: (data) => ipcRenderer.invoke('prestamos:extender', data),
    registrarDevolucion: (codigo) => ipcRenderer.invoke('prestamos:devolver', codigo)


    
});