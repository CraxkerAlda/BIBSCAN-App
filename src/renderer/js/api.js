/* ==========================================================================
   BIBSCAN — Capa de acceso al backend vía window.api
   Único punto de consumo de IPC. No se añaden métodos inexistentes.
   ========================================================================== */

window.BIBSCAN_API = (() => {
    async function invoke(promise) {
        try {
            return await promise;
        } catch (err) {
            console.error('[api] Error de comunicación IPC:', err);
            throw new Error('Error de comunicación con el sistema. Intente de nuevo.');
        }
    }

    return {
        login: (creds) => invoke(window.api.login(creds)),
        obtenerLibros: () => invoke(window.api.obtenerLibros()),
        agregarLibro: (data) => invoke(window.api.agregarLibro(data)),
        obtenerUsuarios: () => invoke(window.api.obtenerUsuarios()),
        agregarUsuario: (data) => invoke(window.api.agregarUsuario(data)),
        registrarPrestamo: (data) => invoke(window.api.registrarPrestamo(data)),
        registrarDevolucion: (codigo) => invoke(window.api.registrarDevolucion(codigo))
    };
})();
