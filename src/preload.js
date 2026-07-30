const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Autenticación
    login: (creds) => ipcRenderer.invoke('auth:login', creds),
    
    // Libros
    obtenerLibros: () => ipcRenderer.invoke('libros:obtenerTodos'),
    agregarLibro: (data) => ipcRenderer.invoke('libros:agregar', data),
    
    // Usuarios (Alumnos/Docentes)
    obtenerUsuarios: () => ipcRenderer.invoke('usuarios:obtenerTodos'),
    agregarUsuario: (data) => ipcRenderer.invoke('usuarios:agregar', data),
    
    // Circulación
    registrarPrestamo: (data) => ipcRenderer.invoke('prestamos:registrar', data),
    registrarDevolucion: (codigo) => ipcRenderer.invoke('prestamos:devolver', codigo)
});