# Estado del desarrollo

## Fase -1
- ✅ Auditoría completada (solo lectura)

## Fase 0
- ✅ package.json corregido (inconsistencia demostrada E2/E3)
- ✅ package-lock.json reparado (autorizado: entrada picomatch faltante)
- ✅ Require authControllers corregido (E1)
- ✅ IPC corregidos (usuarios:obtenerTodos, usuarios:agregar, prestamos:devolver)
- ✅ Controllers usuarioController.js y devolucionController.js creados
- ✅ Semilla admin/admin123 (idempotente)
- ✅ sqlite3 cargado en ABI de Electron 43 (sin nuevas dependencias)
- ✅ Login funcionando

## Fase 2
- ✅ Arquitectura visual: css/styles.css (design system completo)
- ✅ Layout común: sidebar, topbar, footer, navegación (js/layout.js)
- ✅ Componentes UI: toast, modal, confirmación, loader, estados vacíos (js/ui.js)
- ✅ Capa de acceso window.api (js/api.js)
- ✅ Orchestrador de páginas (js/app-renderer.js)
- ✅ index.html con shell + sesión en sessionStorage + redirect a login
- ✅ Docente oculta acciones admin vía clase CSS (verificado)
- ✅ Verificación DOM en Electron: 12/12 PASS

## Fase 3
- ✅ Pantalla login.html funcional
- ✅ Autenticación con window.api.login()
- ✅ Sesión y rol en sessionStorage
- ✅ Redirección index <-> login según sesión
- ✅ Validación de formulario y manejo de errores
- ✅ Verificación end-to-end Electron: 8/8 PASS

## Fase 4
- ✅ Dashboard: stats-grid con 4 tarjetas (catálogo, disponibles, prestados, usuarios)
- ✅ Input de escáner con autofocus y Enter para buscar por código de barras
- ✅ Escaneo existente: alerta info con datos del libro
- ✅ Escaneo inexistente: alerta warning
- ✅ Accesos rápidos: nuevo préstamo / nuevo libro / nuevo usuario (admin solo)
- ✅ Rol docente oculta .quick-action--admin (CSS, sin borrar del DOM) (verificado)
- ✅ Verificación DOM en Electron: 7/7 PASS (RESULT: ALL PASS)
- ✅ La app real arranca vía npm start (4 procesos Electron vivos)

### Nota de verificación (harness)
- El script de verificación tuvo fallos intermitentes (cuelgues/crash silencioso del proceso)
  durante loadFile en esta máquina (network-service de Chromium inestable con Electron 43).
  Solución usada en el harness: no lanzar con `& electron.exe script.js` capturando stdout
  directo; canalizar a archivo (`2>&1 | Out-File`), window con show:false, reintentos con
  race + destruir/recrear ventana, watchdog 75s. Con eso: 7/7 PASS limpio.
  La app real NO se ve afectada (npm start estable).

## Fase 5
- ✅ Catálogo (views/catalogo.html): tabla con código, título, autor, categoría, editorial, año, estado
- ✅ Búsqueda en vivo (código, título, autor, categoría, editorial) con contador de resultados
- ✅ Estado del libro: badge Disponible/Prestado según `disponible`
- ✅ Alta de libro (modal, solo admin): validación, campos coincidentes con `agregarLibro`, duplicado controlado
- ✅ Toast de éxito al registrar; error inline si el código ya existe
- ✅ Etiquetas CODE128 con JSBarcode v3.11.6 vendorizado en `src/renderer/vendor/jsbarcode/`
- ✅ Modal de etiqueta: SVG del código + título + imprimir (window.print con CSS @media print)
- ✅ Docente: oculta "Nuevo libro" (CSS `[data-rol="docente"] .toolbar-action--admin`), puede ver catálogo y etiquetas
- ✅ Verificación DOM en Electron: 18/18 PASS (RESULT: ALL PASS)
- ✅ App real arranca vía npm start tras el cambio

## Fase 6
- ✅ Usuarios (views/usuarios.html): tabla con nombre, tipo, grado, grupo, estado
- ✅ Búsqueda en vivo por nombre, grado, grupo y tipo con contador
- ✅ Alta de usuario (modal, solo admin): tipo alumno/docente, grado y grupo visibles solo para alumno
- ✅ Validación: nombre obligatorio (error inline sin llamar IPC)
- ✅ Badges: Alumno/Docente y Activo/Inactivo según `tipo` y `activo`
- ✅ Docente: oculta "Nuevo usuario" y el ítem Usuarios del menú (CSS)
- ✅ Verificación DOM en Electron: 16/16 PASS (RESULT: ALL PASS)

## Fase 7
- ✅ Préstamos (views/prestamos.html): selector segmentado Préstamo/Devolución
- ✅ Formulario de préstamo: escáner con autofocus + select de usuarios activos
- ✅ Formulario de devolución: escáner con autofocus
- ✅ Flujo completo verificado con controllers reales: préstamo (disponible 1→0), duplicado ("ya está prestado"), devolución (0→1), sin préstamo activo, libro inexistente
- ✅ Validación y mensajes de error/warning en línea, Enter del escáner dispara la acción
- ✅ Toast de éxito en operaciones; input limpio y autofocus tras cada operación
- ✅ Aviso cuando no hay usuarios activos registrados
- ✅ Verificación DOM en Electron: 14/14 PASS (RESULT: ALL PASS)

## Fase 8
- ✅ Integración E2E: login real (admin/admin123) → dashboard → navegación por sidebar real
- ✅ Sesión persistente entre páginas (chip de usuario en topbar)
- ✅ Logout limpia sesión y redirige a login
- ✅ Guard: acceso a index.html sin sesión redirige a login
- ✅ Ciclo completo repetido sin recargar proceso
- ✅ Verificación DOM en Electron: 13/13 PASS (RESULT: ALL PASS)

## Fase 9
- ✅ Init único por página (nav y chip no duplicados, sin loaders colgados)
- ✅ Tiempos de carga < 1s en las 5 vistas (login, dashboard, catálogo, préstamos, usuarios)
- ✅ Cero errores de consola en todas las vistas
- ✅ Debounce de búsqueda (200ms) en catálogo y usuarios
- ✅ Verificación DOM en Electron: 9/9 PASS (RESULT: ALL PASS)

## Fase 10
- ✅ Revisión de código: sin TODO/FIXME; console.error solo para IPC/sesión inválida (intencionado)
- ✅ Datos de prueba eliminados de data/biblioteca.db (libros, usuarios, préstamos) — queda solo la semilla admin/admin123
- ✅ Login admin verificado tras la limpieza
- ✅ Smoke test final vía npm start (app estable, 4 procesos Electron vivos)

## Resumen final
- Frontend completo en src/renderer/: design system, layout común, sesión y roles, 5 vistas (login, dashboard, catálogo, préstamos, usuarios)
- 0 dependencias nuevas (JSBarcode vendorizado), solo window.api, sin frameworks
- Verificaciones por fase: Fase 2=12/12, Fase 3=8/8, Fase 4=7/7, Fase 5=18/18, Fase 6=16/16, Fase 7=14/14, Fase 8=13/13, Fase 9=9/9 → todas ALL PASS

## Sugerencias de commit (no ejecutadas)
- fix(ipc): registrar handlers faltantes y corregir requires (Fase 0)
- fix(deps): sincronizar package.json y reparar lockfile (Fase 0)
- feat(ui): layout común, design system y navegación (Fase 2)
- feat(login): autenticación con window.api (Fase 3)
- feat(dashboard): panel de control con métricas y escáner (Fase 4)
- feat(catalogo): listado, búsqueda, alta y etiquetas CODE128 (Fase 5)
- feat(usuarios): gestión de usuarios de la biblioteca (Fase 6)
- feat(prestamos): registro de préstamos y devoluciones con escáner (Fase 7)
- feat(navegacion): integración completa de módulos y sesión (Fase 8)
- perf(renderer): init único y tiempos de carga verificados (Fase 9)

## Archivos modificados
- package.json
- package-lock.json (solo entrada picomatch, autorizado)
- src/main/main.js
- src/main/db-config.js
- src/main/controllers/usuarioController.js (nuevo)
- src/main/controllers/devolucionController.js (nuevo)
- src/renderer/css/styles.css
- src/renderer/js/ui.js (nuevo)
- src/renderer/js/api.js (nuevo)
- src/renderer/js/layout.js (nuevo)
- src/renderer/js/app-renderer.js
- src/renderer/views/index.html
- src/renderer/views/login.html
- src/renderer/views/catalogo.html (nuevo)
- src/renderer/vendor/jsbarcode/JsBarcode.all.min.js (nuevo, v3.11.6 MIT)
- src/renderer/js/layout.js (iconos barcode/plus/search añadidos)
- src/renderer/views/usuarios.html (nuevo)
- src/renderer/views/prestamos.html (nuevo)

## Problemas pendientes
- Los hallazgos E6/E7 se mantienen como observaciones; no bloquean.
- data/biblioteca.db quedó limpio tras la Fase 10 (solo semilla admin/admin123).
