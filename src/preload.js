const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Ejemplo de llamadas IPC expuestas al frontend
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    obtenerLibros: () => ipcRenderer.invoke('libros:obtenerTodos'),
    registrarPrestamo: (data) => ipcRenderer.invoke('prestamos:registrar', data)
});