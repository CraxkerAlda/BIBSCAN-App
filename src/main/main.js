const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { db, initDatabase } = require('./db-config');

// Importar los controladores del Backend
const authController = require('./controllers/authControllers');
const libroController = require('./controllers/libroController');
const prestamoController = require('./controllers/prestamoController');
const usuarioController = require('./controllers/usuarioController');
const devolucionController = require('./controllers/devolucionController');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "BIBSCAN - Escuela Primaria Benito Juárez",
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/views/index.html'));
}

app.whenReady().then(() => {
    initDatabase();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- REGISTRO DE CANALES IPC DE ESCUCHA ---
ipcMain.handle('auth:login', (event, creds) => authController.login(db, creds));
ipcMain.handle('libros:obtenerTodos', () => libroController.obtenerLibros(db));
ipcMain.handle('libros:agregar', (event, data) => libroController.agregarLibro(db, data));
ipcMain.handle('prestamos:registrar', (event, data) => prestamoController.registrarPrestamo(db, data));
ipcMain.handle('usuarios:obtenerTodos', () => usuarioController.obtenerUsuarios(db));
ipcMain.handle('usuarios:agregar', (event, data) => usuarioController.agregarUsuario(db, data));
ipcMain.handle('prestamos:devolver', (event, codigo) => devolucionController.devolver(db, codigo));