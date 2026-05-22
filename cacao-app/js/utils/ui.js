/* ================================================================
   ui.js — Utilidades UI (Modal, Toast, Confirm, Loader)
================================================================ */

const UI = {

    // ===== TOAST =====
    toast(message, type = 'info', title = null) {
        const container = document.getElementById('toastContainer');
        const icons = { success: 'circle-check', error: 'circle-xmark', warning: 'triangle-exclamation', info: 'circle-info' };
        const titles = { success: 'Éxito', error: 'Error', warning: 'Atención', info: 'Información' };
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `
            <div class="toast-icon"><i class="fa-solid fa-${icons[type] || 'circle-info'}"></i></div>
            <div class="toast-content">
                <strong>${Helpers.escapeHtml(title || titles[type])}</strong>
                <span>${Helpers.escapeHtml(message)}</span>
            </div>
        `;
        container.appendChild(el);
        setTimeout(() => {
            el.classList.add('out');
            setTimeout(() => el.remove(), 250);
        }, 3500);
    },

    // ===== MODAL =====
    openModal({ title, body, footer = '', size = '' }) {
        const overlay = document.getElementById('modalContainer');
        const modal = document.getElementById('modal');
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        document.getElementById('modalFooter').innerHTML = footer;
        modal.className = 'modal' + (size ? ' modal-' + size : '');
        overlay.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('modalContainer').style.display = 'none';
        document.getElementById('modalBody').innerHTML = '';
        document.getElementById('modalFooter').innerHTML = '';
    },

    // ===== CONFIRM =====
    confirm({ title = '¿Confirmar acción?', message = 'Esta acción no se puede deshacer.', okText = 'Confirmar', cancelText = 'Cancelar', danger = true }) {
        return new Promise(resolve => {
            const container = document.getElementById('confirmContainer');
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
            const okBtn = document.getElementById('confirmOk');
            const cancelBtn = document.getElementById('confirmCancel');
            okBtn.textContent = okText;
            cancelBtn.textContent = cancelText;
            okBtn.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
            container.style.display = 'flex';

            const cleanup = (val) => {
                container.style.display = 'none';
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                resolve(val);
            };
            okBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
        });
    },

    // ===== LOADER =====
    hideLoader() {
        const l = document.getElementById('globalLoader');
        l.classList.add('hidden');
        setTimeout(() => l.style.display = 'none', 500);
    },

    // ===== PAGE HEADER =====
    pageHeader(title, subtitle, actionsHTML = '') {
        return `
            <div class="page-header">
                <div class="page-title">
                    <h1>${Helpers.escapeHtml(title)}</h1>
                    <p>${Helpers.escapeHtml(subtitle)}</p>
                </div>
                <div class="page-actions">${actionsHTML}</div>
            </div>
        `;
    },

    // ===== EMPTY STATE =====
    emptyState(icon, title, message, ctaHTML = '') {
        return `
            <div class="table-empty">
                <i class="fa-solid fa-${icon}"></i>
                <h3>${Helpers.escapeHtml(title)}</h3>
                <p>${Helpers.escapeHtml(message)}</p>
                ${ctaHTML ? `<div style="margin-top:14px;">${ctaHTML}</div>` : ''}
            </div>
        `;
    },

    // ===== Helper para serializar formularios =====
    serializeForm(formEl) {
        const fd = new FormData(formEl);
        const obj = {};
        fd.forEach((value, key) => {
            if (key.endsWith('[]')) {
                const k = key.slice(0, -2);
                obj[k] = obj[k] || [];
                obj[k].push(value);
            } else if (obj[key] !== undefined) {
                obj[key] = Array.isArray(obj[key]) ? [...obj[key], value] : [obj[key], value];
            } else {
                obj[key] = value;
            }
        });
        // Capturar arrays de selección multiple manualmente para evitar perderlos
        formEl.querySelectorAll('select[multiple]').forEach(sel => {
            obj[sel.name] = Array.from(sel.selectedOptions).map(o => o.value);
        });
        // Capturar checkboxes individuales no marcados como falsos explícitos
        formEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.name && !cb.checked && !cb.name.endsWith('[]')) obj[cb.name] = false;
            else if (cb.name && cb.checked && !cb.name.endsWith('[]')) obj[cb.name] = true;
        });
        return obj;
    }
};
