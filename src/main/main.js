const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { db, initDatabase } = require('./db-config');

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

// Listener IPC de prueba
ipcMain.handle('libros:obtenerTodos', () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM LIBROS', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
});