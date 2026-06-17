/* ================================================================
   modules/auditoria.js — Historial global de cambios
================================================================ */

const AuditoriaModule = {

    state: { filterType: '', filterUser: '', filterAction: '', dateFrom: '', dateTo: '', search: '' },

    render() {
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Auditoría', 'Historial completo de cambios en el flujo (orden → nota → orden de compra)', `
                <button class="btn btn-outline" onclick="AuditoriaModule.exportExcel()"><i class="fa-solid fa-file-excel"></i> Excel</button>
            `)}
            <div id="auditView"></div>
        `;
        this.renderView();
    },

    renderView() {
        const cfg = Storage.get(Storage.KEYS.config, {});
        const users = cfg.usuarios || [];
        const all = Audit.list();
        let filtered = all;

        if (this.state.filterType)   filtered = filtered.filter(e => e.entityType === this.state.filterType);
        if (this.state.filterUser)   filtered = filtered.filter(e => e.user === this.state.filterUser);
        if (this.state.filterAction) filtered = filtered.filter(e => e.action === this.state.filterAction);
        if (this.state.dateFrom)     filtered = filtered.filter(e => (e.timestamp || '') >= this.state.dateFrom);
        if (this.state.dateTo)       filtered = filtered.filter(e => (e.timestamp || '') <= this.state.dateTo + 'T23:59:59');
        if (this.state.search) {
            const s = this.state.search.toLowerCase();
            filtered = filtered.filter(e =>
                (e.entityNumero || '').toLowerCase().includes(s) ||
                (e.details || '').toLowerCase().includes(s) ||
                (e.user || '').toLowerCase().includes(s)
            );
        }

        // KPIs
        const totalEventos = all.length;
        const usuariosUnicos = [...new Set(all.map(e => e.user))].length;
        const hoy = Helpers.today();
        const eventosHoy = all.filter(e => (e.timestamp || '').startsWith(hoy)).length;

        const usersList = [...new Set(all.map(e => e.user))].sort();
        const actions = ['crear', 'editar', 'eliminar', 'confirmar', 'estado', 'asignar_ruta', 'generar_nota', 'generar_oc', 'multi_viaje'];
        const types = ['orden', 'nota', 'prefactura', 'ruta', 'finca', 'vehiculo'];

        const rows = filtered.map(e => `
            <tr>
                <td><small>${Helpers.formatDateTime(e.timestamp)}</small></td>
                <td><strong>${Helpers.escapeHtml(e.user)}</strong></td>
                <td><span class="badge badge-gray">${Audit.entityLabel(e.entityType)}</span></td>
                <td>${e.entityNumero ? `<strong>${Helpers.escapeHtml(e.entityNumero)}</strong>` : '-'}</td>
                <td><span class="badge ${Audit.actionColor(e.action)}">${Audit.actionLabel(e.action)}</span></td>
                <td>${Helpers.escapeHtml(e.details)}</td>
                <td>${e.changes && e.changes.length ? `<button class="btn btn-sm btn-ghost" onclick="AuditoriaModule.showChanges('${e.id}')"><i class="fa-solid fa-eye"></i> ${e.changes.length}</button>` : '<span class="text-muted">—</span>'}</td>
            </tr>
        `).join('');

        document.getElementById('auditView').innerHTML = `
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-label">Eventos totales</span><div class="kpi-icon"><i class="fa-solid fa-clock-rotate-left"></i></div></div>
                    <div class="kpi-value">${totalEventos}</div>
                </div>
                <div class="kpi-card kpi-info">
                    <div class="kpi-header"><span class="kpi-label">Usuarios activos</span><div class="kpi-icon"><i class="fa-solid fa-users"></i></div></div>
                    <div class="kpi-value">${usuariosUnicos}</div>
                </div>
                <div class="kpi-card kpi-cacao">
                    <div class="kpi-header"><span class="kpi-label">Eventos hoy</span><div class="kpi-icon"><i class="fa-solid fa-calendar-day"></i></div></div>
                    <div class="kpi-value">${eventosHoy}</div>
                </div>
                <div class="kpi-card kpi-warning">
                    <div class="kpi-header"><span class="kpi-label">Filtrados</span><div class="kpi-icon"><i class="fa-solid fa-filter"></i></div></div>
                    <div class="kpi-value">${filtered.length}</div>
                </div>
            </div>

            <div class="table-wrap">
                <div class="table-toolbar" style="flex-wrap:wrap;">
                    <div class="search-box" style="width:220px;">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Buscar..." value="${Helpers.escapeHtml(this.state.search)}"
                               oninput="AuditoriaModule.state.search=this.value; AuditoriaModule.renderView();">
                    </div>
                    <select onchange="AuditoriaModule.state.filterType=this.value; AuditoriaModule.renderView();">
                        <option value="">Todas las entidades</option>
                        ${types.map(t => `<option value="${t}" ${this.state.filterType === t ? 'selected' : ''}>${Audit.entityLabel(t)}</option>`).join('')}
                    </select>
                    <select onchange="AuditoriaModule.state.filterAction=this.value; AuditoriaModule.renderView();">
                        <option value="">Todas las acciones</option>
                        ${actions.map(a => `<option value="${a}" ${this.state.filterAction === a ? 'selected' : ''}>${Audit.actionLabel(a)}</option>`).join('')}
                    </select>
                    <select onchange="AuditoriaModule.state.filterUser=this.value; AuditoriaModule.renderView();">
                        <option value="">Todos los usuarios</option>
                        ${usersList.map(u => `<option value="${Helpers.escapeHtml(u)}" ${this.state.filterUser === u ? 'selected' : ''}>${Helpers.escapeHtml(u)}</option>`).join('')}
                    </select>
                    <input type="date" value="${this.state.dateFrom}" title="Desde" onchange="AuditoriaModule.state.dateFrom=this.value; AuditoriaModule.renderView();">
                    <input type="date" value="${this.state.dateTo}" title="Hasta" onchange="AuditoriaModule.state.dateTo=this.value; AuditoriaModule.renderView();">
                    ${(this.state.filterType || this.state.filterUser || this.state.filterAction || this.state.dateFrom || this.state.dateTo || this.state.search) ? `<button class="btn btn-sm btn-ghost" onclick="AuditoriaModule._clear()"><i class="fa-solid fa-xmark"></i> Limpiar</button>` : ''}
                    <span class="text-muted" style="margin-left:auto;">${filtered.length} de ${all.length}</span>
                </div>
                <table class="data-table">
                    <thead><tr><th style="width:160px;">Fecha</th><th>Usuario</th><th>Entidad</th><th>Documento</th><th>Acción</th><th>Detalle</th><th style="width:80px;">Cambios</th></tr></thead>
                    <tbody>${rows || `<tr><td colspan="7">${UI.emptyState('clock-rotate-left', 'Sin eventos', 'No hay eventos con los filtros aplicados.')}</td></tr>`}</tbody>
                </table>
            </div>

            <div class="card mt-3">
                <div class="card-header"><div class="card-title">Línea de tiempo (vista rápida)</div></div>
                <div class="card-body" style="max-height:400px; overflow-y:auto;">
                    ${Audit.renderTimeline(filtered.slice(0, 30))}
                </div>
            </div>
        `;
    },

    _clear() {
        this.state = { filterType: '', filterUser: '', filterAction: '', dateFrom: '', dateTo: '', search: '' };
        this.renderView();
    },

    showChanges(id) {
        const e = Audit.list().find(x => x.id === id);
        if (!e) return;
        UI.openModal({
            title: `Cambios · ${e.entityNumero || Audit.entityLabel(e.entityType)}`,
            body: `
                <p><strong>Usuario:</strong> ${Helpers.escapeHtml(e.user)} · <strong>Fecha:</strong> ${Helpers.formatDateTime(e.timestamp)}</p>
                <p><strong>Acción:</strong> <span class="badge ${Audit.actionColor(e.action)}">${Audit.actionLabel(e.action)}</span></p>
                ${e.details ? `<p>${Helpers.escapeHtml(e.details)}</p>` : ''}
                <h4 style="margin-top:14px; color:var(--cacao-700);">Cambios registrados</h4>
                <table class="data-table" style="margin-top:8px;">
                    <thead><tr><th>Campo</th><th>Valor anterior</th><th>Valor nuevo</th></tr></thead>
                    <tbody>
                        ${e.changes.map(c => `
                            <tr>
                                <td><strong>${Helpers.escapeHtml(c.field)}</strong></td>
                                <td style="color:var(--danger);">${Helpers.escapeHtml(Audit._fmt(c.before))}</td>
                                <td style="color:var(--success);">${Helpers.escapeHtml(Audit._fmt(c.after))}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `,
            footer: `<button class="btn btn-primary" onclick="UI.closeModal()">Cerrar</button>`
        });
    },

    exportExcel() {
        const list = Audit.list();
        const ws = XLSX.utils.json_to_sheet(list.map(e => ({
            Fecha: Helpers.formatDateTime(e.timestamp),
            Usuario: e.user,
            Entidad: Audit.entityLabel(e.entityType),
            Documento: e.entityNumero,
            Acción: Audit.actionLabel(e.action),
            Detalle: e.details,
            Cambios: (e.changes || []).map(c => `${c.field}: ${Audit._fmt(c.before)} → ${Audit._fmt(c.after)}`).join(' · ')
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Auditoria');
        XLSX.writeFile(wb, 'Auditoria_SmartCacao.xlsx');
        UI.toast('Excel descargado', 'success');
    }
};
