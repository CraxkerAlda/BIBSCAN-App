/* ==========================================================================
   BIBSCAN — Layout común (sidebar, topbar, footer) y gestión de sesión
   ========================================================================== */

window.BIBSCAN_LAYOUT = (() => {
    const SESSION_KEY = 'bibscan_user';

    const ICONS = {
        book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
        dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
        catalog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5a2 2 0 012-2h4v18H5a2 2 0 01-2-2V5z"/><path d="M21 5a2 2 0 00-2-2h-4v18h4a2 2 0 002-2V5z"/></svg>',
        loan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h4"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M17.5 14a6.5 6.5 0 014 6"/></svg>',
        logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
        scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/><path d="M3 12h18"/></svg>',
        plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5v14M5 12h14"/></svg>',
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>',
        barcode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5v14M6.5 5v14M10 5v9M14 5v14M17.5 5v5M21 5v14"/></svg>'
    };

    const NAV = [
        { page: 'dashboard', href: 'index.html', label: 'Inicio', icon: ICONS.dashboard },
        { page: 'catalogo', href: 'catalogo.html', label: 'Catálogo', icon: ICONS.catalog },
        { page: 'prestamos', href: 'prestamos.html', label: 'Préstamos', icon: ICONS.loan },
        { page: 'usuarios', href: 'usuarios.html', label: 'Usuarios', icon: ICONS.users, admin: true }
    ];

    const PAGE_TITLES = {
        dashboard: 'Panel de control',
        catalogo: 'Catálogo de libros',
        prestamos: 'Préstamos y devoluciones',
        usuarios: 'Usuarios de la biblioteca'
    };

    function getSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY));
        } catch (err) {
            console.error('[layout] Sesión inválida:', err);
            return null;
        }
    }

    function setSession(user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function requireSession() {
        const onLoginPage = location.pathname.endsWith('login.html');
        if (!getSession() && !onLoginPage) {
            location.replace('login.html');
            return false;
        }
        if (getSession() && onLoginPage) {
            location.replace('index.html');
            return false;
        }
        return true;
    }

    function buildSidebar(activePage) {
        const items = NAV.map((item) => {
            const isActive = item.page === activePage ? ' nav-item--active' : '';
            const isAdmin = item.admin ? ' nav-item--admin' : '';
            return `
                <a class="nav-item${isActive}${isAdmin}" href="${item.href}" data-nav="${item.page}">
                    ${item.icon}<span>${item.label}</span>
                </a>
            `;
        }).join('');

        return `
            <div class="sidebar__brand">
                <div class="sidebar__brand-logo">${ICONS.book}</div>
                <div>
                    <div class="sidebar__brand-name">BIBSCAN</div>
                    <div class="sidebar__brand-sub">Biblioteca Escolar</div>
                </div>
            </div>
            <nav class="sidebar__nav" aria-label="Navegación principal">
                <div class="nav-label">Menú</div>
                ${items}
            </nav>
            <div class="sidebar__footer">Primaria Benito Juárez · v1.0.0</div>
        `;
    }

    function buildTopbar(page, session) {
        const initials = window.BIBSCAN_UI.initials(session.nombre);
        const roleLabel = session.rol === 'administrador' ? 'Administrador' : 'Docente';
        return `
            <div class="topbar__title">${PAGE_TITLES[page] || 'BIBSCAN'}</div>
            <div class="topbar__right">
                <div class="user-chip">
                    <div class="user-chip__avatar">${initials}</div>
                    <div class="user-chip__meta">
                        <div class="user-chip__name">${window.BIBSCAN_UI.escapeHtml(session.nombre)}</div>
                        <div class="user-chip__role">${roleLabel}</div>
                    </div>
                </div>
                <button type="button" class="btn btn--secondary btn--sm" id="logout-btn" title="Cerrar sesión">
                    ${ICONS.logout}<span>Salir</span>
                </button>
            </div>
        `;
    }

    function wireEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                clearSession();
                location.replace('login.html');
            });
        }
    }

    function init() {
        if (!requireSession()) return false;

        const session = getSession();
        if (!session) return true;

        const page = document.body.dataset.page || '';
        document.body.setAttribute('data-rol', session.rol);

        const sidebarSlot = document.getElementById('sidebar-slot');
        if (sidebarSlot) sidebarSlot.innerHTML = buildSidebar(page);

        const topbarSlot = document.getElementById('topbar-slot');
        if (topbarSlot) topbarSlot.innerHTML = buildTopbar(page, session);

        const footerSlot = document.getElementById('footer-slot');
        if (footerSlot) {
            footerSlot.textContent = 'BIBSCAN · Sistema de Gestión Bibliotecaria · Escuela Primaria Benito Juárez';
        }

        wireEvents();
        return true;
    }

    return {
        init,
        getSession,
        setSession,
        clearSession,
        requireSession,
        ICONS
    };
})();
