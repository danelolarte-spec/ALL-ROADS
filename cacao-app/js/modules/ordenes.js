/* ================================================================
   modules/ordenes.js — Órdenes de Servicio (CRUD + confirmación + agenda)
================================================================ */

const OrdenesModule = {

    state: { view: 'tabla', search: '', filterEstado: '', filterFecha: '', sortKey: 'fecha', sortAsc: false, calMonth: null },

    ESTADOS: ['Pendiente', 'Confirmada', 'En ruta', 'Recolectada', 'Finalizada'],
    CALIDADES: ['Estándar', 'Premium', 'Excelencia'],
    TIPOS: ['Seco', 'En baba'],

    nextNumero() {
        const ord = Storage.list(Storage.KEYS.ordenes);
        const year = new Date().getFullYear();
        const max = ord
            .map(o => parseInt((o.numero || '').split('-').pop()) || 0)
            .reduce((a, b) => Math.max(a, b), 0);
        return `OS-${year}-${String(max + 1).padStart(4, '0')}`;
    },

    render() {
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Órdenes de Servicio', 'Gestiona órdenes y confirma recolecciones', `
                <button class="btn btn-outline" onclick="OrdenesModule.exportExcel()"><i class="fa-solid fa-file-excel"></i> Excel</button>
                <button class="btn btn-primary" onclick="OrdenesModule.openForm()"><i class="fa-solid fa-plus"></i> Nueva orden</button>
            `)}

            <div class="tabs">
                <button class="tab ${this.state.view === 'tabla' ? 'active' : ''}" onclick="OrdenesModule.switchView('tabla')"><i class="fa-solid fa-table"></i> Tabla</button>
                <button class="tab ${this.state.view === 'agenda' ? 'active' : ''}" onclick="OrdenesModule.switchView('agenda')"><i class="fa-solid fa-list-ul"></i> Agenda</button>
                <button class="tab ${this.state.view === 'calendario' ? 'active' : ''}" onclick="OrdenesModule.switchView('calendario')"><i class="fa-regular fa-calendar"></i> Calendario</button>
            </div>

            <div id="ordenesView"></div>
        `;
        this.renderView();
    },

    switchView(v) { this.state.view = v; this.render(); },

    renderView() {
        const target = document.getElementById('ordenesView');
        if (this.state.view === 'tabla') target.innerHTML = this.renderTable();
        if (this.state.view === 'agenda') target.innerHTML = this.renderAgenda();
        if (this.state.view === 'calendario') target.innerHTML = this.renderCalendar();
    },

    _filtered() {
        let list = Storage.list(Storage.KEYS.ordenes);
        const s = this.state.search.toLowerCase();
        const fincas = Storage.list(Storage.KEYS.fincas);
        const fincaMap = Object.fromEntries(fincas.map(f => [f.id, f]));
        if (s) {
            list = list.filter(o => {
                const f = fincaMap[o.fincaId];
                return o.numero.toLowerCase().includes(s) ||
                    (f && (f.nombre.toLowerCase().includes(s) || f.propietario.toLowerCase().includes(s)));
            });
        }
        if (this.state.filterEstado) list = list.filter(o => o.estado === this.state.filterEstado);
        if (this.state.filterFecha) list = list.filter(o => o.fecha === this.state.filterFecha);
        return Helpers.sortBy(list, this.state.sortKey, this.state.sortAsc);
    },

    renderTable() {
        const list = this._filtered();
        const fincas = Storage.list(Storage.KEYS.fincas);
        const fincaMap = Object.fromEntries(fincas.map(f => [f.id, f]));

        const rows = list.map(o => {
            const f = fincaMap[o.fincaId];
            return `
                <tr>
                    <td><strong>${Helpers.escapeHtml(o.numero)}</strong></td>
                    <td>${Helpers.formatDate(o.fecha)}</td>
                    <td>
                        ${f ? `<strong>${Helpers.escapeHtml(f.nombre)}</strong><br><span class="text-muted" style="font-size:11px;">${Helpers.escapeHtml(f.propietario)}</span>` : '<span class="text-muted">Finca eliminada</span>'}
                    </td>
                    <td><span class="badge badge-gray">${o.tipoCacao}</span></td>
                    <td>${Helpers.formatNumber(o.cantidad)} <span class="text-muted">kg</span></td>
                    <td>${this._calidadBadge(o.calidad)}</td>
                    <td>${this._estadoBadge(o.estado)}</td>
                    <td>${this._confirmBadge(o)}</td>
                    <td>
                        <div class="row-actions">
                            <button onclick="OrdenesModule.viewDetail('${o.id}')" title="Ver"><i class="fa-solid fa-eye"></i></button>
                            <button onclick="OrdenesModule.openForm('${o.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="PDFGen.ordenServicio(Storage.findById(Storage.KEYS.ordenes, '${o.id}'))" title="PDF"><i class="fa-solid fa-file-pdf"></i></button>
                            ${o.estado === 'Recolectada' || o.estado === 'Finalizada' ? '' : `<button onclick="NotasModule.crearDesdeOrden('${o.id}')" title="Generar nota"><i class="fa-solid fa-file-circle-plus"></i></button>`}
                            <button class="danger" onclick="OrdenesModule.deleteOrden('${o.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        const opcionesEstado = ['<option value="">Todos los estados</option>', ...this.ESTADOS.map(e => `<option value="${e}" ${this.state.filterEstado === e ? 'selected' : ''}>${e}</option>`)].join('');

        return `
            <div class="table-wrap">
                <div class="table-toolbar">
                    <div class="search-box" style="width:260px;">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Buscar orden o finca..." value="${Helpers.escapeHtml(this.state.search)}"
                               oninput="OrdenesModule.state.search=this.value; OrdenesModule.renderView();">
                    </div>
                    <select onchange="OrdenesModule.state.filterEstado=this.value; OrdenesModule.renderView();">${opcionesEstado}</select>
                    <input type="date" value="${this.state.filterFecha}" onchange="OrdenesModule.state.filterFecha=this.value; OrdenesModule.renderView();">
                    ${this.state.filterEstado || this.state.filterFecha ? `<button class="btn btn-sm btn-ghost" onclick="OrdenesModule.state.filterEstado=''; OrdenesModule.state.filterFecha=''; OrdenesModule.renderView();"><i class="fa-solid fa-xmark"></i> Limpiar</button>` : ''}
                    <span class="text-muted" style="margin-left:auto;">${list.length} órdenes</span>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th onclick="OrdenesModule.sort('numero')">Número</th>
                            <th onclick="OrdenesModule.sort('fecha')">Fecha</th>
                            <th>Finca</th>
                            <th>Tipo</th>
                            <th onclick="OrdenesModule.sort('cantidad')">Cantidad</th>
                            <th>Calidad</th>
                            <th>Estado</th>
                            <th>Confirmación</th>
                            <th style="width:170px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${rows || `<tr><td colspan="9">${UI.emptyState('clipboard-list', 'Sin órdenes', 'Crea tu primera orden de servicio.')}</td></tr>`}</tbody>
                </table>
            </div>
        `;
    },

    renderAgenda() {
        const list = Helpers.sortBy(this._filtered(), 'fecha', true);
        const grouped = {};
        list.forEach(o => { (grouped[o.fecha] = grouped[o.fecha] || []).push(o); });
        const fincas = Storage.list(Storage.KEYS.fincas);
        const fincaMap = Object.fromEntries(fincas.map(f => [f.id, f]));

        if (!list.length) return UI.emptyState('list-ul', 'Sin órdenes', 'No hay órdenes que mostrar.');

        return Object.entries(grouped).map(([fecha, items]) => `
            <div class="card mb-3">
                <div class="card-header">
                    <div>
                        <div class="card-title">${Helpers.formatDate(fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div class="card-subtitle">${items.length} órdenes · ${Helpers.formatKg(items.reduce((a, b) => a + b.cantidad, 0))} totales</div>
                    </div>
                    <span class="badge badge-info">${fecha === Helpers.today() ? 'HOY' : Helpers.formatDate(fecha)}</span>
                </div>
                <div class="card-body">
                    ${items.map(o => {
                        const f = fincaMap[o.fincaId];
                        return `
                            <div class="route-stop">
                                <div class="route-stop-num"><i class="fa-solid fa-clipboard"></i></div>
                                <div class="route-stop-info">
                                    <strong>${o.numero} — ${f ? Helpers.escapeHtml(f.nombre) : 'Finca eliminada'}</strong>
                                    <span>${f ? Helpers.escapeHtml(f.propietario) + ' · ' + Helpers.escapeHtml(f.vereda) : ''}</span>
                                </div>
                                <div class="route-meta">
                                    <strong>${Helpers.formatKg(o.cantidad)}</strong>
                                    <div>${this._estadoBadge(o.estado)} ${this._calidadBadge(o.calidad)}</div>
                                </div>
                                <div style="display:flex; gap:6px;">
                                    <button class="btn btn-sm btn-ghost" onclick="OrdenesModule.viewDetail('${o.id}')"><i class="fa-solid fa-eye"></i></button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    },

    renderCalendar() {
        const refDate = this.state.calMonth ? new Date(this.state.calMonth) : new Date();
        const year = refDate.getFullYear();
        const month = refDate.getMonth();
        const first = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = (first.getDay() + 6) % 7; // Lunes = 0

        const list = Storage.list(Storage.KEYS.ordenes);
        const byDate = {};
        list.forEach(o => { (byDate[o.fecha] = byDate[o.fecha] || []).push(o); });

        const headers = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(h => `<div>${h}</div>`).join('');
        let cells = '';
        for (let i = 0; i < startDay; i++) cells += `<div class="calendar-day empty"></div>`;
        const today = Helpers.today();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const orders = byDate[dateStr] || [];
            const cnt = orders.length;
            const kg = orders.reduce((a, b) => a + b.cantidad, 0);
            const isToday = dateStr === today;
            cells += `
                <div class="calendar-day ${isToday ? 'today' : ''}" onclick="OrdenesModule.state.filterFecha='${dateStr}'; OrdenesModule.switchView('tabla');">
                    <div class="day-num">${d}</div>
                    ${cnt > 0 ? `<div class="day-count">${cnt} órd</div><div class="text-muted" style="font-size:10px; margin-top:4px;">${Helpers.formatKg(kg)}</div>` : ''}
                </div>
            `;
        }

        const monthName = first.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <button class="btn btn-icon btn-ghost" onclick="OrdenesModule._navCal(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                        <strong style="text-transform:capitalize; margin:0 10px;">${monthName}</strong>
                        <button class="btn btn-icon btn-ghost" onclick="OrdenesModule._navCal(1)"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="OrdenesModule.state.calMonth=null; OrdenesModule.renderView();"><i class="fa-solid fa-calendar-day"></i> Hoy</button>
                </div>
                <div class="card-body">
                    <div class="calendar-day-headers">${headers}</div>
                    <div class="calendar">${cells}</div>
                </div>
            </div>
        `;
    },

    _navCal(delta) {
        const ref = this.state.calMonth ? new Date(this.state.calMonth) : new Date();
        ref.setDate(1);
        ref.setMonth(ref.getMonth() + delta);
        this.state.calMonth = ref.toISOString().slice(0, 10);
        this.renderView();
    },

    sort(key) {
        if (this.state.sortKey === key) this.state.sortAsc = !this.state.sortAsc;
        else { this.state.sortKey = key; this.state.sortAsc = true; }
        this.renderView();
    },

    // ===== Badges =====
    _estadoBadge(e) {
        const map = {
            'Pendiente': 'badge-warning', 'Confirmada': 'badge-info',
            'En ruta': 'badge-cacao', 'Recolectada': 'badge-success', 'Finalizada': 'badge-gray'
        };
        return `<span class="badge ${map[e] || 'badge-gray'}">${e}</span>`;
    },
    _calidadBadge(c) {
        const map = { 'Estándar': 'badge-estandar', 'Premium': 'badge-premium', 'Excelencia': 'badge-excelencia' };
        return `<span class="badge ${map[c] || 'badge-gray'}">${c}</span>`;
    },
    _confirmBadge(o) {
        if (o.confirmadaLlamada && o.confirmadaDiaAnterior) return `<span class="status-dot green"></span>Total`;
        if (o.confirmadaLlamada || o.confirmadaDiaAnterior) return `<span class="status-dot yellow"></span>Parcial`;
        return `<span class="status-dot red"></span>Sin confirmar`;
    },

    // ===== FORM =====
    openForm(id = null) {
        const isEdit = !!id;
        const o = isEdit ? Storage.findById(Storage.KEYS.ordenes, id) : { fecha: Helpers.today(), estado: 'Pendiente' };
        const fincas = Storage.list(Storage.KEYS.fincas);
        const clones = Storage.list(Storage.KEYS.clones);

        this._formClones = o.clones ? [...o.clones] : [];

        UI.openModal({
            title: isEdit ? `Editar ${o.numero}` : 'Nueva orden de servicio',
            size: 'lg',
            body: `
                <form id="ordenForm">
                    <input type="hidden" name="id" value="${o.id || ''}">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Número</label>
                            <input type="text" name="numero" value="${o.numero || this.nextNumero()}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Fecha <span class="req">*</span></label>
                            <input type="date" name="fecha" required value="${o.fecha || Helpers.today()}">
                        </div>
                        <div class="form-group">
                            <label>Finca <span class="req">*</span></label>
                            <select name="fincaId" required>
                                <option value="">— Selecciona —</option>
                                ${fincas.map(f => `<option value="${f.id}" ${o.fincaId === f.id ? 'selected' : ''}>${Helpers.escapeHtml(f.nombre)} (${Helpers.escapeHtml(f.propietario)})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Tipo de cacao <span class="req">*</span></label>
                            <select name="tipoCacao" required>
                                ${this.TIPOS.map(t => `<option value="${t}" ${o.tipoCacao === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Cantidad (kg) <span class="req">*</span></label>
                            <input type="number" step="0.1" name="cantidad" required min="1" value="${o.cantidad || ''}">
                        </div>
                        <div class="form-group">
                            <label>Calidad <span class="req">*</span></label>
                            <select name="calidad" required>
                                ${this.CALIDADES.map(c => `<option value="${c}" ${o.calidad === c ? 'selected' : ''}>${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estado</label>
                            <select name="estado">
                                ${this.ESTADOS.map(e => `<option value="${e}" ${o.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group full">
                            <label>Clones a recolectar</label>
                            <div class="chip-input" id="ordChipsContainer">
                                ${this._formClones.map(c => `<span class="chip">${Helpers.escapeHtml(c)} <button type="button" onclick="OrdenesModule._removeClone('${c}')"><i class="fa-solid fa-xmark"></i></button></span>`).join('')}
                            </div>
                            <div class="chip-select" style="margin-top:8px;">
                                <select id="ordCloneSelect">
                                    <option value="">— Selecciona un clon —</option>
                                    ${clones.map(c => `<option value="${Helpers.escapeHtml(c.nombre)}">${Helpers.escapeHtml(c.nombre)}</option>`).join('')}
                                </select>
                                <button type="button" class="btn btn-sm btn-outline" onclick="OrdenesModule._addClone()"><i class="fa-solid fa-plus"></i> Añadir</button>
                            </div>
                        </div>
                        <div class="form-group full">
                            <label>Observaciones</label>
                            <textarea name="observaciones">${Helpers.escapeHtml(o.observaciones || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-row"><input type="checkbox" name="confirmadaLlamada" ${o.confirmadaLlamada ? 'checked' : ''}> Confirmada vía llamada</label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-row"><input type="checkbox" name="confirmadaDiaAnterior" ${o.confirmadaDiaAnterior ? 'checked' : ''}> Confirmada el día anterior</label>
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="OrdenesModule.save()"><i class="fa-solid fa-check"></i> ${isEdit ? 'Actualizar' : 'Crear'}</button>
            `
        });
    },

    _addClone() {
        const sel = document.getElementById('ordCloneSelect');
        const v = sel.value;
        if (!v) return;
        if (this._formClones.includes(v)) { UI.toast('Ya está seleccionado', 'warning'); return; }
        this._formClones.push(v);
        document.getElementById('ordChipsContainer').innerHTML =
            this._formClones.map(c => `<span class="chip">${c} <button type="button" onclick="OrdenesModule._removeClone('${c}')"><i class="fa-solid fa-xmark"></i></button></span>`).join('');
        sel.value = '';
    },
    _removeClone(c) {
        this._formClones = this._formClones.filter(x => x !== c);
        document.getElementById('ordChipsContainer').innerHTML =
            this._formClones.map(cl => `<span class="chip">${cl} <button type="button" onclick="OrdenesModule._removeClone('${cl}')"><i class="fa-solid fa-xmark"></i></button></span>`).join('');
    },

    save() {
        const form = document.getElementById('ordenForm');
        const data = UI.serializeForm(form);
        if (!data.fincaId || !data.cantidad) { UI.toast('Completa los campos requeridos', 'error'); return; }
        const payload = {
            numero: data.numero,
            fecha: data.fecha,
            fincaId: data.fincaId,
            tipoCacao: data.tipoCacao,
            cantidad: parseFloat(data.cantidad),
            calidad: data.calidad,
            estado: data.estado || 'Pendiente',
            clones: [...this._formClones],
            observaciones: data.observaciones || '',
            confirmadaLlamada: !!data.confirmadaLlamada,
            confirmadaDiaAnterior: !!data.confirmadaDiaAnterior
        };
        if (data.id) {
            Storage.update(Storage.KEYS.ordenes, data.id, payload);
            UI.toast('Orden actualizada', 'success');
        } else {
            Storage.add(Storage.KEYS.ordenes, payload);
            UI.toast('Orden creada', 'success');
        }
        UI.closeModal();
        this.render();
    },

    viewDetail(id) {
        const o = Storage.findById(Storage.KEYS.ordenes, id);
        const f = Storage.findById(Storage.KEYS.fincas, o.fincaId);
        UI.openModal({
            title: `Orden ${o.numero}`,
            body: `
                <div class="grid-2">
                    <div>
                        <h4 style="color:var(--cacao-700); margin-bottom:8px;">Datos de la orden</h4>
                        <p><strong>Número:</strong> ${o.numero}</p>
                        <p><strong>Fecha:</strong> ${Helpers.formatDate(o.fecha)}</p>
                        <p><strong>Tipo:</strong> ${o.tipoCacao}</p>
                        <p><strong>Cantidad:</strong> ${Helpers.formatKg(o.cantidad)}</p>
                        <p><strong>Calidad:</strong> ${this._calidadBadge(o.calidad)}</p>
                        <p><strong>Estado:</strong> ${this._estadoBadge(o.estado)}</p>
                        <p><strong>Confirmación:</strong> ${this._confirmBadge(o)}</p>
                        <p><strong>Clones:</strong> ${(o.clones || []).join(', ') || '-'}</p>
                        <p><strong>Observaciones:</strong> ${Helpers.escapeHtml(o.observaciones || '-')}</p>
                    </div>
                    <div>
                        ${f ? `
                            <h4 style="color:var(--cacao-700); margin-bottom:8px;">Finca asociada</h4>
                            <p><strong>${Helpers.escapeHtml(f.nombre)}</strong></p>
                            <p>${Helpers.escapeHtml(f.propietario)} · CC ${Helpers.escapeHtml(f.cedula)}</p>
                            <p>${Helpers.escapeHtml(f.vereda)}, ${Helpers.escapeHtml(f.municipio)}</p>
                            <p>Tel: ${Helpers.escapeHtml(f.telefono)}</p>
                        ` : '<p class="text-muted">Finca eliminada</p>'}
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cerrar</button>
                <button class="btn btn-outline" onclick="PDFGen.ordenServicio(Storage.findById(Storage.KEYS.ordenes,'${o.id}'))"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                <button class="btn btn-secondary" onclick="OrdenesModule._toggleConfirm('${o.id}'); UI.closeModal();"><i class="fa-solid fa-phone"></i> Confirmar llamada</button>
                ${o.estado !== 'Finalizada' && o.estado !== 'Recolectada' ? `<button class="btn btn-primary" onclick="NotasModule.crearDesdeOrden('${o.id}'); UI.closeModal();"><i class="fa-solid fa-file-circle-plus"></i> Generar nota</button>` : ''}
            `
        });
    },

    _toggleConfirm(id) {
        const o = Storage.findById(Storage.KEYS.ordenes, id);
        const patch = { confirmadaLlamada: !o.confirmadaLlamada };
        if (patch.confirmadaLlamada && o.estado === 'Pendiente') patch.estado = 'Confirmada';
        Storage.update(Storage.KEYS.ordenes, id, patch);
        UI.toast(patch.confirmadaLlamada ? 'Orden confirmada' : 'Confirmación retirada', 'success');
        this.renderView();
    },

    async deleteOrden(id) {
        const ok = await UI.confirm({ title: '¿Eliminar orden?', message: 'Esta acción no se puede deshacer.' });
        if (!ok) return;
        Storage.remove_item(Storage.KEYS.ordenes, id);
        UI.toast('Orden eliminada', 'success');
        this.render();
    },

    exportExcel() {
        const list = Storage.list(Storage.KEYS.ordenes);
        const fincas = Object.fromEntries(Storage.list(Storage.KEYS.fincas).map(f => [f.id, f]));
        const ws = XLSX.utils.json_to_sheet(list.map(o => ({
            Número: o.numero, Fecha: o.fecha, Finca: fincas[o.fincaId]?.nombre || '',
            Propietario: fincas[o.fincaId]?.propietario || '', Tipo: o.tipoCacao,
            Cantidad: o.cantidad, Calidad: o.calidad, Estado: o.estado,
            Clones: (o.clones || []).join(', '), ConfirmadaLlamada: o.confirmadaLlamada ? 'SI' : 'NO',
            ConfirmadaDiaAnterior: o.confirmadaDiaAnterior ? 'SI' : 'NO', Observaciones: o.observaciones
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ordenes');
        XLSX.writeFile(wb, 'Ordenes_CacaoFlow.xlsx');
        UI.toast('Excel descargado', 'success');
    }
};
