/* ================================================================
   audit.js — Sistema de auditoría / historial de cambios
   ================================================================
   Registra cada cambio en el flujo (órdenes, notas, OC, rutas)
   con usuario, fecha y descripción del cambio.
================================================================ */

const Audit = {

    KEY: 'auditLog',

    // ===== Registrar un evento =====
    log({ entityType, entityId, entityNumero, action, details, changes, user }) {
        const cfg = Storage.get(Storage.KEYS.config, {});
        const userName = user || cfg.currentUser || 'Administrador';
        const entry = {
            id: Helpers.uid('log'),
            timestamp: Helpers.now(),
            user: userName,
            entityType,
            entityId,
            entityNumero: entityNumero || '',
            action,
            details: details || '',
            changes: changes || []
        };
        const log = Storage.get(this.KEY, []);
        log.push(entry);
        Storage.set(this.KEY, log);
        return entry;
    },

    // ===== Listar / filtrar =====
    list({ entityType = null, entityId = null, user = null, action = null, dateFrom = null, dateTo = null, limit = null } = {}) {
        let log = Storage.get(this.KEY, []);
        if (entityType) log = log.filter(e => e.entityType === entityType);
        if (entityId) log = log.filter(e => e.entityId === entityId);
        if (user) log = log.filter(e => e.user === user);
        if (action) log = log.filter(e => e.action === action);
        if (dateFrom) log = log.filter(e => e.timestamp >= dateFrom);
        if (dateTo) log = log.filter(e => e.timestamp <= dateTo + 'T23:59:59');
        log = log.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        if (limit) log = log.slice(0, limit);
        return log;
    },

    // ===== Detectar cambios entre dos objetos =====
    diff(before, after, fields) {
        const changes = [];
        for (const f of fields) {
            const a = before?.[f];
            const b = after?.[f];
            const aStr = a === undefined || a === null ? '' : (typeof a === 'object' ? JSON.stringify(a) : String(a));
            const bStr = b === undefined || b === null ? '' : (typeof b === 'object' ? JSON.stringify(b) : String(b));
            if (aStr !== bStr) {
                changes.push({ field: f, before: a, after: b });
            }
        }
        return changes;
    },

    // ===== Etiquetas legibles =====
    actionLabel(action) {
        const map = {
            'crear': 'Creación',
            'editar': 'Edición',
            'eliminar': 'Eliminación',
            'confirmar': 'Confirmación',
            'estado': 'Cambio de estado',
            'asignar_ruta': 'Asignación a ruta',
            'desasignar_ruta': 'Desasignación de ruta',
            'generar_nota': 'Generación de nota',
            'generar_oc': 'Generación de Orden de Compra',
            'multi_viaje': 'División en múltiples viajes',
            'imprimir': 'Impresión / PDF',
            'login': 'Inicio de sesión'
        };
        return map[action] || action;
    },

    actionColor(action) {
        const map = {
            'crear':         'badge-success',
            'editar':        'badge-info',
            'eliminar':      'badge-danger',
            'confirmar':     'badge-success',
            'estado':        'badge-warning',
            'asignar_ruta':  'badge-cacao',
            'generar_nota':  'badge-info',
            'generar_oc':    'badge-premium',
            'multi_viaje':   'badge-warning'
        };
        return map[action] || 'badge-gray';
    },

    entityLabel(type) {
        const map = {
            'orden':     'Orden de servicio',
            'nota':      'Nota de recolección',
            'prefactura':'Orden de compra',
            'ruta':      'Ruta',
            'finca':     'Finca',
            'vehiculo':  'Vehículo'
        };
        return map[type] || type;
    },

    // ===== Helper para renderizar la línea de tiempo =====
    renderTimeline(entries) {
        if (!entries || !entries.length) return '<p class="text-muted text-center" style="padding:20px;">Sin eventos registrados</p>';
        return `
            <div class="timeline">
                ${entries.map(e => `
                    <div class="timeline-item">
                        <strong>
                            <span class="badge ${this.actionColor(e.action)}">${this.actionLabel(e.action)}</span>
                            ${e.entityNumero ? ` · ${Helpers.escapeHtml(e.entityNumero)}` : ''}
                        </strong>
                        <span>${Helpers.formatDateTime(e.timestamp)} · por <strong>${Helpers.escapeHtml(e.user)}</strong></span>
                        ${e.details ? `<p>${Helpers.escapeHtml(e.details)}</p>` : ''}
                        ${e.changes && e.changes.length ? `
                            <div style="margin-top:6px; padding:8px; background:var(--bg-body); border-radius:6px; font-size:11px;">
                                ${e.changes.map(c => `
                                    <div><strong>${Helpers.escapeHtml(c.field)}:</strong>
                                    <span style="color:var(--danger);">${Helpers.escapeHtml(this._fmt(c.before))}</span>
                                    → <span style="color:var(--success);">${Helpers.escapeHtml(this._fmt(c.after))}</span></div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },

    _fmt(v) {
        if (v === null || v === undefined || v === '') return '(vacío)';
        if (Array.isArray(v)) return v.join(', ');
        if (typeof v === 'boolean') return v ? 'SÍ' : 'NO';
        return String(v);
    }
};
