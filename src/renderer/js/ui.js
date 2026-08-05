/* ==========================================================================
   BIBSCAN — Componentes de interfaz
   Toast, modal, confirmación, loader, estados vacíos y helpers de UI.
   ========================================================================== */

window.BIBSCAN_UI = (() => {
    const ICONS = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3L2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
        empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
    };

    function toastRoot() {
        let root = document.getElementById('toast-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'toast-root';
            root.className = 'toast-root';
            document.body.appendChild(root);
        }
        return root;
    }

    function toast(message, type = 'info', duration = 3500) {
        const el = document.createElement('div');
        el.className = `toast toast--${type}`;
        el.innerHTML = `${ICONS[type] || ICONS.info}<span>${escapeHtml(message)}</span>`;
        toastRoot().appendChild(el);

        const remove = () => {
            el.classList.add('is-leaving');
            setTimeout(() => el.remove(), 200);
        };

        const timer = setTimeout(remove, duration);
        el.addEventListener('click', () => {
            clearTimeout(timer);
            remove();
        });
        return el;
    }

    function modalRoot() {
        let root = document.getElementById('modal-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'modal-root';
            document.body.appendChild(root);
        }
        return root;
    }

    function modal({ title = '', body = '', wide = false, onClose } = {}) {
        const root = modalRoot();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const close = () => {
            overlay.remove();
            if (typeof onClose === 'function') onClose();
        };

        overlay.innerHTML = `
            <div class="modal ${wide ? 'modal--wide' : ''}" role="dialog" aria-modal="true">
                <div class="modal__header">
                    <h3 class="modal__title">${escapeHtml(title)}</h3>
                    <button type="button" class="modal__close" aria-label="Cerrar">${ICONS.close}</button>
                </div>
                <div class="modal__body"></div>
            </div>
        `;

        const bodyEl = overlay.querySelector('.modal__body');
        if (typeof body === 'string') {
            bodyEl.innerHTML = body;
        } else if (body instanceof HTMLElement) {
            bodyEl.appendChild(body);
        }

        overlay.querySelector('.modal__close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        root.appendChild(overlay);
        return { close, body: bodyEl };
    }

    function confirmDialog({ title = 'Confirmar', message = '', confirmText = 'Aceptar', cancelText = 'Cancelar', danger = false }) {
        return new Promise((resolve) => {
            const { close, body } = modal({ title, wide: false });

            const actions = document.createElement('div');
            actions.className = 'form-actions';

            const btnCancel = document.createElement('button');
            btnCancel.type = 'button';
            btnCancel.className = 'btn btn--secondary';
            btnCancel.textContent = cancelText;

            const btnConfirm = document.createElement('button');
            btnConfirm.type = 'button';
            btnConfirm.className = danger ? 'btn btn--danger' : 'btn btn--primary';
            btnConfirm.textContent = confirmText;

            actions.append(btnCancel, btnConfirm);

            const p = document.createElement('p');
            p.style.fontSize = '0.92rem';
            p.textContent = message;

            body.append(p, actions);

            const done = (value) => {
                close();
                resolve(value);
            };

            btnCancel.addEventListener('click', () => done(false));
            btnConfirm.addEventListener('click', () => done(true));
        });
    }

    function openLoader(text = 'Cargando...') {
        const overlay = document.createElement('div');
        overlay.className = 'loader-overlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
            <div class="loader-text">${escapeHtml(text)}</div>
        `;
        document.body.appendChild(overlay);
        return { close: () => overlay.remove() };
    }

    function emptyState(message, title = 'Sin resultados') {
        const el = document.createElement('div');
        el.className = 'empty-state';
        el.innerHTML = `
            <div class="empty-state__icon">${ICONS.empty}</div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
        `;
        return el;
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setBusy(btn, busy, busyText = 'Procesando...') {
        if (busy) {
            btn.dataset.originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner spinner--sm" style="border-color:#fff;border-top-color:transparent;"></span> ${escapeHtml(busyText)}`;
        } else {
            btn.disabled = false;
            if (btn.dataset.originalText) {
                btn.innerHTML = btn.dataset.originalText;
                delete btn.dataset.originalText;
            }
        }
    }

    function initials(name) {
        if (!name) return '?';
        return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
    }

    return {
        toast,
        modal,
        confirm: confirmDialog,
        openLoader,
        emptyState,
        escapeHtml,
        setBusy,
        initials
    };
})();
