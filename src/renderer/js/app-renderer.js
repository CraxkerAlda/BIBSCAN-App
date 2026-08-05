/* ==========================================================================
   BIBSCAN — Punto de entrada del renderer
   Inicializa el layout común y delega en el módulo de cada página.
   ========================================================================== */

window.BIBSCAN = window.BIBSCAN || {};

window.BIBSCAN.api = window.BIBSCAN_API;
window.BIBSCAN.ui = window.BIBSCAN_UI;
window.BIBSCAN.layout = window.BIBSCAN_LAYOUT;
window.BIBSCAN.pages = {};

/* ============================== Página: Login ============================== */

BIBSCAN.pages.login = (() => {
    const FIELDS = {
        usuario: 'field-usuario',
        contrasena: 'field-contrasena'
    };

    function showError(message) {
        const alert = document.getElementById('login-error');
        document.getElementById('login-error-text').textContent = message;
        alert.classList.remove('hidden');
    }

    function clearErrors() {
        document.getElementById('login-error').classList.add('hidden');
        Object.values(FIELDS).forEach((id) => document.getElementById(id).classList.remove('field--error'));
    }

    function validate(form) {
        let valid = true;
        const usuario = form.elements.usuario.value.trim();
        const contrasena = form.elements.contrasena.value;

        if (!usuario) {
            document.getElementById(FIELDS.usuario).classList.add('field--error');
            valid = false;
        }
        if (!contrasena) {
            document.getElementById(FIELDS.contrasena).classList.add('field--error');
            valid = false;
        }
        return valid;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        clearErrors();

        if (!validate(form)) return;

        const btn = document.getElementById('login-btn');
        BIBSCAN.ui.setBusy(btn, true, 'Verificando...');

        try {
            const result = await BIBSCAN.api.login({
                usuario: form.elements.usuario.value.trim(),
                contrasena: form.elements.contrasena.value
            });

            if (result && result.success && result.user) {
                BIBSCAN.layout.setSession(result.user);
                location.replace('index.html');
                return;
            }

            showError((result && result.message) || 'No se pudo iniciar sesión.');
        } catch (err) {
            showError(err.message || 'Error de comunicación con el sistema.');
        } finally {
            BIBSCAN.ui.setBusy(btn, false);
        }
    }

    function init() {
        const form = document.getElementById('login-form');
        if (!form) return;
        form.addEventListener('submit', handleSubmit);
    }

    return { init };
})();

/* ============================== Página: Dashboard ============================== */

BIBSCAN.pages.dashboard = (() => {
    const ICONS = BIBSCAN.layout.ICONS;

    function statCard(iconClass, icon, value, label) {
        return `
            <div class="stat-card">
                <div class="stat-card__icon ${iconClass}">${icon}</div>
                <div>
                    <div class="stat-card__value">${value}</div>
                    <div class="stat-card__label">${BIBSCAN.ui.escapeHtml(label)}</div>
                </div>
            </div>
        `;
    }

    async function loadStats() {
        const container = document.getElementById('stats-grid');
        const loader = BIBSCAN.ui.openLoader('Cargando panel...');

        try {
            const [libros, usuarios] = await Promise.all([
                BIBSCAN.api.obtenerLibros(),
                BIBSCAN.api.obtenerUsuarios()
            ]);

            const total = (libros || []).length;
            const disponibles = (libros || []).filter((l) => l.disponible === 1).length;
            const prestados = total - disponibles;

            container.innerHTML =
                statCard('stat-card__icon--blue', ICONS.catalog, total, 'Libros en el catálogo') +
                statCard('stat-card__icon--green', ICONS.book, disponibles, 'Libros disponibles') +
                statCard('stat-card__icon--amber', ICONS.loan, prestados, 'Libros prestados') +
                statCard('stat-card__icon--slate', ICONS.users, (usuarios || []).length, 'Usuarios registrados');
        } catch (err) {
            container.innerHTML = `
                <div class="alert alert--error">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
                    <span>${BIBSCAN.ui.escapeHtml(err.message)}</span>
                </div>
            `;
        } finally {
            loader.close();
        }
    }

    function renderScanResult(libro, code) {
        const target = document.getElementById('scan-result');
        if (!libro) {
            target.innerHTML = `
                <div class="alert alert--warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>
                    <span>No se encontró el libro con código <strong>${BIBSCAN.ui.escapeHtml(code)}</strong>.</span>
                </div>
            `;
            return;
        }

        const badge = libro.disponible === 1
            ? '<span class="badge badge--success">Disponible</span>'
            : '<span class="badge badge--danger">Prestado</span>';

        target.innerHTML = `
            <div class="alert alert--info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
                <div>
                    <div><strong>${BIBSCAN.ui.escapeHtml(libro.titulo)}</strong> ${badge}</div>
                    <div class="muted" style="font-size:.82rem">
                        ${BIBSCAN.ui.escapeHtml(libro.autor || 'Autor desconocido')}
                        ${libro.editorial ? ' · ' + BIBSCAN.ui.escapeHtml(libro.editorial) : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async function handleScan() {
        const input = document.getElementById('scan-code');
        const code = input.value.trim();
        if (!code) return;

        try {
            const libros = await BIBSCAN.api.obtenerLibros();
            const found = (libros || []).find((l) => l.codigo_barras === code);
            renderScanResult(found, code);
            input.value = '';
        } catch (err) {
            document.getElementById('scan-result').innerHTML = `
                <div class="alert alert--error"><span>${BIBSCAN.ui.escapeHtml(err.message)}</span></div>
            `;
            input.value = '';
        } finally {
            input.focus();
        }
    }

    function setupScanner() {
        const input = document.getElementById('scan-code');
        if (!input) return;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleScan();
            }
        });
    }

    function init() {
        loadStats();
        setupScanner();
    }

    return { init };
})();

/* ============================== Página: Catálogo ============================== */

BIBSCAN.pages.catalogo = (() => {
    const ICONS = BIBSCAN.layout.ICONS;
    let libros = [];
    let current = [];
    let searchTimer = null;

    function badgeFor(libro) {
        return libro.disponible === 1
            ? '<span class="badge badge--success">Disponible</span>'
            : '<span class="badge badge--danger">Prestado</span>';
    }

    function rowFor(libro, idx) {
        return `
            <tr>
                <td><span class="code-chip">${BIBSCAN.ui.escapeHtml(libro.codigo_barras)}</span></td>
                <td><strong>${BIBSCAN.ui.escapeHtml(libro.titulo)}</strong></td>
                <td>${BIBSCAN.ui.escapeHtml(libro.autor || '—')}</td>
                <td>${BIBSCAN.ui.escapeHtml(libro.categoria || '—')}</td>
                <td>${BIBSCAN.ui.escapeHtml(libro.editorial || '—')}</td>
                <td>${libro.anio_publicacion || '—'}</td>
                <td>${badgeFor(libro)}</td>
                <td class="col-actions">
                    <button type="button" class="btn btn--secondary btn--sm" data-etiqueta="${idx}" title="Generar etiqueta de código de barras">
                        ${ICONS.barcode}<span>Etiqueta</span>
                    </button>
                </td>
            </tr>
        `;
    }

    function renderTable() {
        const tbody = document.getElementById('catalogo-body');
        const table = document.getElementById('catalogo-table');
        const empty = document.getElementById('catalogo-empty');

        if (current.length === 0) {
            table.classList.add('hidden');
            empty.innerHTML = '';
            empty.appendChild(BIBSCAN.ui.emptyState(
                libros.length === 0
                    ? 'Aún no hay libros registrados en el catálogo.'
                    : 'Ningún libro coincide con la búsqueda.',
                libros.length === 0 ? 'Sin libros' : 'Sin coincidencias'
            ));
        } else {
            table.classList.remove('hidden');
            empty.innerHTML = '';
            tbody.innerHTML = current.map(rowFor).join('');
        }

        document.getElementById('result-count').textContent =
            libros.length === 0 ? '' : `${current.length} de ${libros.length} libro(s)`;
    }

    function applyFilter() {
        const q = document.getElementById('search-catalogo').value.trim().toLowerCase();
        current = !q
            ? libros.slice()
            : libros.filter((l) =>
                ['codigo_barras', 'titulo', 'autor', 'categoria', 'editorial']
                    .some((key) => String(l[key] || '').toLowerCase().includes(q)));
        renderTable();
    }

    async function loadLibros() {
        try {
            libros = (await BIBSCAN.api.obtenerLibros()) || [];
        } catch (err) {
            libros = [];
            BIBSCAN.ui.toast(err.message, 'error');
        }
        applyFilter();
    }

    function setFieldError(field, message) {
        const fieldEl = field.closest('.field');
        const errorEl = fieldEl.querySelector('.field__error');
        if (message) {
            if (errorEl) errorEl.textContent = message;
            fieldEl.classList.add('field--error');
        } else {
            fieldEl.classList.remove('field--error');
        }
    }

    function validateForm(form) {
        let valid = true;
        ['f-codigo', 'f-titulo'].forEach((id) => {
            const input = form.elements[id];
            if (!input.value.trim()) {
                setFieldError(input, 'Este campo es obligatorio.');
                valid = false;
            } else {
                setFieldError(input, '');
            }
        });

        const anio = form.elements['f-anio'];
        const anioValue = anio.value.trim();
        if (anioValue && (!/^\d{1,4}$/.test(anioValue) || parseInt(anioValue, 10) < 0 || parseInt(anioValue, 10) > 2100)) {
            setFieldError(anio, 'Ingrese un año válido (ej. 2024).');
            valid = false;
        } else {
            setFieldError(anio, '');
        }
        return valid;
    }

    function showFormError(form, message) {
        const box = form.querySelector('.form-error');
        box.textContent = message;
        box.classList.remove('hidden');
    }

    function clearFormError(form) {
        form.querySelector('.form-error').classList.add('hidden');
    }

    function openFormModal() {
        const form = document.createElement('form');
        form.className = 'form';
        form.innerHTML = `
            <div class="form-error alert alert--error hidden"></div>
            <div class="form-row">
                <div class="field">
                    <label for="f-codigo">Código de barras *</label>
                    <input class="input" id="f-codigo" maxlength="30" autocomplete="off" autofocus>
                    <div class="field__error"></div>
                </div>
                <div class="field">
                    <label for="f-titulo">Título *</label>
                    <input class="input" id="f-titulo" maxlength="200">
                    <div class="field__error"></div>
                </div>
            </div>
            <div class="form-row">
                <div class="field">
                    <label for="f-autor">Autor</label>
                    <input class="input" id="f-autor" maxlength="150">
                    <div class="field__error"></div>
                </div>
                <div class="field">
                    <label for="f-genero">Género</label>
                    <input class="input" id="f-genero" maxlength="50">
                    <div class="field__error"></div>
                </div>
            </div>
            <div class="form-row">
                <div class="field">
                    <label for="f-categoria">Categoría</label>
                    <input class="input" id="f-categoria" maxlength="80">
                    <div class="field__error"></div>
                </div>
                <div class="field">
                    <label for="f-editorial">Editorial</label>
                    <input class="input" id="f-editorial" maxlength="120">
                    <div class="field__error"></div>
                </div>
                <div class="field">
                    <label for="f-anio">Año de publicación</label>
                    <input class="input" id="f-anio" type="number" min="0" max="2100" placeholder="Ej. 2024">
                    <div class="field__error"></div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn--secondary" data-cerrar>Cancelar</button>
                <button type="submit" class="btn btn--primary" id="f-submit">Guardar libro</button>
            </div>
        `;

        const { close, body } = BIBSCAN.ui.modal({ title: 'Nuevo libro', body: form });

        form.querySelector('[data-cerrar]').addEventListener('click', close);
        ['f-codigo', 'f-titulo', 'f-anio'].forEach((id) => {
            form.elements[id].addEventListener('input', () => {
                setFieldError(form.elements[id], '');
                clearFormError(form);
            });
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearFormError(form);
            if (!validateForm(form)) return;

            const btn = form.elements['f-submit'];
            BIBSCAN.ui.setBusy(btn, true, 'Guardando...');

            try {
                const result = await BIBSCAN.api.agregarLibro({
                    codigo_barras: form.elements['f-codigo'].value.trim(),
                    titulo: form.elements['f-titulo'].value.trim(),
                    autor: form.elements['f-autor'].value.trim(),
                    genero: form.elements['f-genero'].value.trim(),
                    categoria: form.elements['f-categoria'].value.trim(),
                    editorial: form.elements['f-editorial'].value.trim(),
                    anio_publicacion: form.elements['f-anio'].value
                        ? parseInt(form.elements['f-anio'].value, 10)
                        : null
                });

                if (result && result.success) {
                    close();
                    BIBSCAN.ui.toast('Libro registrado correctamente.', 'success');
                    await loadLibros();
                } else {
                    showFormError(form, (result && result.message) || 'No se pudo registrar el libro.');
                }
            } catch (err) {
                showFormError(form, err.message);
            } finally {
                BIBSCAN.ui.setBusy(btn, false);
            }
        });

        return { close };
    }

    function openLabelModal(libro) {
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="barcode-preview">
                <div class="barcode-canvas"></div>
                <div class="barcode-meta">
                    <div class="barcode-meta__title">${BIBSCAN.ui.escapeHtml(libro.titulo)}</div>
                    <div class="code-chip">${BIBSCAN.ui.escapeHtml(libro.codigo_barras)}</div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn--primary" id="btn-imprimir-etiqueta">
                        ${ICONS.scan}<span>Imprimir etiqueta</span>
                    </button>
                </div>
            </div>
        `;

        const { close, body } = BIBSCAN.ui.modal({ title: 'Etiqueta de código de barras', body: content });
        const modalEl = body.closest('.modal');
        if (modalEl) modalEl.classList.add('modal--label');

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        try {
            JsBarcode(svg, libro.codigo_barras, {
                format: 'CODE128',
                width: 2,
                height: 64,
                displayValue: true,
                margin: 10,
                font: 'monospace'
            });
            body.querySelector('.barcode-canvas').appendChild(svg);
        } catch (err) {
            body.querySelector('.barcode-canvas').textContent = 'No se pudo generar el código de barras.';
        }

        body.querySelector('#btn-imprimir-etiqueta').addEventListener('click', () => window.print());
    }

    function wireTable() {
        document.getElementById('catalogo-body').addEventListener('click', (event) => {
            const btn = event.target.closest('[data-etiqueta]');
            if (!btn) return;
            const idx = parseInt(btn.getAttribute('data-etiqueta'), 10);
            const libro = current[idx];
            if (libro) openLabelModal(libro);
        });
    }

    function wireToolbar() {
        document.getElementById('btn-nuevo-libro').addEventListener('click', openFormModal);
        const search = document.getElementById('search-catalogo');
        search.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(applyFilter, 200);
        });
    }

    function init() {
        wireToolbar();
        wireTable();
        loadLibros();
    }

    return { init };
})();

/* ============================== Página: Usuarios ============================== */

BIBSCAN.pages.usuarios = (() => {
    let usuarios = [];
    let current = [];
    let searchTimer = null;

    const GRADOS = ['1', '2', '3', '4', '5', '6'];
    const GRUPOS = ['A', 'B', 'C', 'D'];

    function tipoBadge(tipo) {
        if (tipo === 'docente') return '<span class="badge badge--neutral">Docente</span>';
        return '<span class="badge badge--info">Alumno</span>';
    }

    function activoBadge(activo) {
        return activo === 1
            ? '<span class="badge badge--success">Activo</span>'
            : '<span class="badge badge--neutral">Inactivo</span>';
    }

    function rowFor(u) {
        return `
            <tr>
                <td><strong>${BIBSCAN.ui.escapeHtml(u.nombre_completo)}</strong></td>
                <td>${tipoBadge(u.tipo)}</td>
                <td>${u.grado ? BIBSCAN.ui.escapeHtml(u.grado) + 'º' : '—'}</td>
                <td>${u.grupo ? BIBSCAN.ui.escapeHtml(u.grupo) : '—'}</td>
                <td>${activoBadge(u.activo)}</td>
            </tr>
        `;
    }

    function renderTable() {
        const tbody = document.getElementById('usuarios-body');
        const table = document.getElementById('usuarios-table');
        const empty = document.getElementById('usuarios-empty');

        if (current.length === 0) {
            table.classList.add('hidden');
            empty.innerHTML = '';
            empty.appendChild(BIBSCAN.ui.emptyState(
                usuarios.length === 0
                    ? 'Aún no hay usuarios registrados.'
                    : 'Ningún usuario coincide con la búsqueda.',
                usuarios.length === 0 ? 'Sin usuarios' : 'Sin coincidencias'
            ));
        } else {
            table.classList.remove('hidden');
            empty.innerHTML = '';
            tbody.innerHTML = current.map(rowFor).join('');
        }

        document.getElementById('result-count').textContent =
            usuarios.length === 0 ? '' : `${current.length} de ${usuarios.length} usuario(s)`;
    }

    function applyFilter() {
        const q = document.getElementById('search-usuarios').value.trim().toLowerCase();
        current = !q
            ? usuarios.slice()
            : usuarios.filter((u) =>
                ['nombre_completo', 'grado', 'grupo', 'tipo']
                    .some((key) => String(u[key] || '').toLowerCase().includes(q)));
        renderTable();
    }

    async function loadUsuarios() {
        try {
            usuarios = (await BIBSCAN.api.obtenerUsuarios()) || [];
        } catch (err) {
            usuarios = [];
            BIBSCAN.ui.toast(err.message, 'error');
        }
        applyFilter();
    }

    function setFieldError(field, message) {
        const fieldEl = field.closest('.field');
        const errorEl = fieldEl.querySelector('.field__error');
        if (message) {
            if (errorEl) errorEl.textContent = message;
            fieldEl.classList.add('field--error');
        } else {
            fieldEl.classList.remove('field--error');
        }
    }

    function validateForm(form) {
        let valid = true;
        const nombre = form.elements['f-nombre'];
        if (!nombre.value.trim()) {
            setFieldError(nombre, 'Este campo es obligatorio.');
            valid = false;
        } else {
            setFieldError(nombre, '');
        }
        return valid;
    }

    function showFormError(form, message) {
        const box = form.querySelector('.form-error');
        box.textContent = message;
        box.classList.remove('hidden');
    }

    function clearFormError(form) {
        form.querySelector('.form-error').classList.add('hidden');
    }

    function openFormModal() {
        const form = document.createElement('form');
        form.className = 'form';
        form.innerHTML = `
            <div class="form-error alert alert--error hidden"></div>
            <div class="field">
                <label for="f-nombre">Nombre completo *</label>
                <input class="input" id="f-nombre" maxlength="150" autocomplete="off" autofocus>
                <div class="field__error"></div>
            </div>
            <div class="form-row">
                <div class="field">
                    <label for="f-tipo">Tipo de usuario *</label>
                    <select class="select" id="f-tipo">
                        <option value="alumno" selected>Alumno</option>
                        <option value="docente">Docente</option>
                    </select>
                    <div class="field__error"></div>
                </div>
                <div class="field" id="campo-grado">
                    <label for="f-grado">Grado</label>
                    <select class="select" id="f-grado">
                        <option value="">— Seleccionar —</option>
                        ${GRADOS.map((g) => `<option value="${g}">${g}º</option>`).join('')}
                    </select>
                    <div class="field__error"></div>
                </div>
                <div class="field" id="campo-grupo">
                    <label for="f-grupo">Grupo</label>
                    <select class="select" id="f-grupo">
                        <option value="">— Seleccionar —</option>
                        ${GRUPOS.map((g) => `<option value="${g}">${g}</option>`).join('')}
                    </select>
                    <div class="field__error"></div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn--secondary" data-cerrar>Cancelar</button>
                <button type="submit" class="btn btn--primary" id="f-submit">Guardar usuario</button>
            </div>
        `;

        const { close, body } = BIBSCAN.ui.modal({ title: 'Nuevo usuario', body: form });

        const toggleGradoGrupo = () => {
            const esDocente = form.elements['f-tipo'].value === 'docente';
            form.elements['f-grado'].closest('.field').style.display = esDocente ? 'none' : '';
            form.elements['f-grupo'].closest('.field').style.display = esDocente ? 'none' : '';
        };

        form.elements['f-tipo'].addEventListener('change', toggleGradoGrupo);
        form.elements['f-nombre'].addEventListener('input', () => {
            setFieldError(form.elements['f-nombre'], '');
            clearFormError(form);
        });
        form.querySelector('[data-cerrar]').addEventListener('click', close);

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearFormError(form);
            if (!validateForm(form)) return;

            const btn = form.elements['f-submit'];
            BIBSCAN.ui.setBusy(btn, true, 'Guardando...');

            const esDocente = form.elements['f-tipo'].value === 'docente';

            try {
                const result = await BIBSCAN.api.agregarUsuario({
                    nombre_completo: form.elements['f-nombre'].value.trim(),
                    tipo: form.elements['f-tipo'].value,
                    grado: esDocente ? null : (form.elements['f-grado'].value || null),
                    grupo: esDocente ? null : (form.elements['f-grupo'].value || null)
                });

                if (result && result.success) {
                    close();
                    BIBSCAN.ui.toast('Usuario registrado correctamente.', 'success');
                    await loadUsuarios();
                } else {
                    showFormError(form, (result && result.message) || 'No se pudo registrar el usuario.');
                }
            } catch (err) {
                showFormError(form, err.message);
            } finally {
                BIBSCAN.ui.setBusy(btn, false);
            }
        });

        return { close };
    }

    function wireToolbar() {
        document.getElementById('btn-nuevo-usuario').addEventListener('click', openFormModal);
        const search = document.getElementById('search-usuarios');
        search.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(applyFilter, 200);
        });
    }

    function init() {
        wireToolbar();
        loadUsuarios();
    }

    return { init };
})();

/* ============================== Página: Préstamos ============================== */

BIBSCAN.pages.prestamos = (() => {
    const ICONS = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'
    };
    let usuarios = [];

    function showResult(containerId, type, message) {
        document.getElementById(containerId).innerHTML = `
            <div class="alert alert--${type}">
                ${ICONS[type] || ICONS.info}
                <span>${BIBSCAN.ui.escapeHtml(message)}</span>
            </div>
        `;
    }

    function setMode(mode) {
        document.getElementById('panel-prestamo').classList.toggle('hidden', mode !== 'prestamo');
        document.getElementById('panel-devolucion').classList.toggle('hidden', mode !== 'devolucion');
        document.querySelectorAll('.segmented button').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.mode === mode);
        });
        const input = document.querySelector(`#panel-${mode} .scanner-input`);
        if (input) input.focus();
    }

    async function loadUsuarios() {
        const select = document.getElementById('select-usuario');
        try {
            usuarios = ((await BIBSCAN.api.obtenerUsuarios()) || []).filter((u) => u.activo === 1);
        } catch (err) {
            usuarios = [];
            BIBSCAN.ui.toast(err.message, 'error');
        }

        if (usuarios.length === 0) {
            select.innerHTML = '<option value="">Sin usuarios activos</option>';
            document.getElementById('prestamo-aviso').classList.remove('hidden');
        } else {
            select.innerHTML = '<option value="">— Seleccionar usuario —</option>' + usuarios
                .map((u) => `<option value="${u.id_usuario}">${BIBSCAN.ui.escapeHtml(u.nombre_completo)} (${u.tipo})</option>`)
                .join('');
            document.getElementById('prestamo-aviso').classList.add('hidden');
        }
    }

    async function handlePrestamo() {
        const codeInput = document.getElementById('scan-prestamo');
        const select = document.getElementById('select-usuario');
        const code = codeInput.value.trim();

        if (!code || !select.value) {
            showResult('result-prestamo', 'warning',
                !code ? 'Escaneé o ingrese el código de barras del libro.' : 'Seleccione el usuario que solicita el préstamo.');
            codeInput.focus();
            return;
        }

        const btn = document.getElementById('btn-prestamo');
        BIBSCAN.ui.setBusy(btn, true, 'Registrando...');

        try {
            const result = await BIBSCAN.api.registrarPrestamo({
                codigo_barras: code,
                id_usuario: parseInt(select.value, 10)
            });

            if (result && result.success) {
                showResult('result-prestamo', 'success', result.message || 'Préstamo registrado exitosamente.');
                codeInput.value = '';
                BIBSCAN.ui.toast('Préstamo registrado.', 'success');
            } else {
                showResult('result-prestamo', 'error', (result && result.message) || 'No se pudo registrar el préstamo.');
            }
        } catch (err) {
            showResult('result-prestamo', 'error', err.message);
        } finally {
            BIBSCAN.ui.setBusy(btn, false);
            codeInput.focus();
        }
    }

    async function handleDevolucion() {
        const codeInput = document.getElementById('scan-devolucion');
        const code = codeInput.value.trim();

        if (!code) {
            showResult('result-devolucion', 'warning', 'Escaneé o ingrese el código de barras del libro.');
            codeInput.focus();
            return;
        }

        const btn = document.getElementById('btn-devolucion');
        BIBSCAN.ui.setBusy(btn, true, 'Registrando...');

        try {
            const result = await BIBSCAN.api.registrarDevolucion(code);
            if (result && result.success) {
                showResult('result-devolucion', 'success', result.message || 'Devolución registrada exitosamente.');
                codeInput.value = '';
                BIBSCAN.ui.toast('Devolución registrada.', 'success');
            } else {
                showResult('result-devolucion', 'error', (result && result.message) || 'No se pudo registrar la devolución.');
            }
        } catch (err) {
            showResult('result-devolucion', 'error', err.message);
        } finally {
            BIBSCAN.ui.setBusy(btn, false);
            codeInput.focus();
        }
    }

    function wireEvents() {
        document.querySelectorAll('.segmented button').forEach((btn) => {
            btn.addEventListener('click', () => setMode(btn.dataset.mode));
        });

        document.getElementById('btn-prestamo').addEventListener('click', handlePrestamo);
        document.getElementById('btn-devolucion').addEventListener('click', handleDevolucion);

        document.getElementById('scan-prestamo').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handlePrestamo();
            }
        });
        document.getElementById('scan-devolucion').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleDevolucion();
            }
        });
    }

    function init() {
        wireEvents();
        loadUsuarios();
    }

    return { init };
})();

function bibscanStart() {
    const ok = window.BIBSCAN.layout.init();
    if (!ok) return;

    const page = document.body.dataset.page || '';
    const pageModule = window.BIBSCAN.pages[page];
    if (pageModule && typeof pageModule.init === 'function') {
        pageModule.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bibscanStart);
} else {
    bibscanStart();
}
