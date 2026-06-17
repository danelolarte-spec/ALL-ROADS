/* ================================================================
   modules/notas.js — Notas de recolección (heredan de orden)
================================================================ */

const NotasModule = {

    state: { search: '' },

    nextNumero() {
        const list = Storage.list(Storage.KEYS.notas);
        const year = new Date().getFullYear();
        const max = list.map(n => parseInt((n.numero || '').split('-').pop()) || 0).reduce((a, b) => Math.max(a, b), 0);
        return `NR-${year}-${String(max + 1).padStart(4, '0')}`;
    },

    render() {
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Notas de Recolección', 'Documentos independientes vinculados a órdenes', `
                <button class="btn btn-outline" onclick="NotasModule.exportExcel()"><i class="fa-solid fa-file-excel"></i> Excel</button>
            `)}
            <div id="notasView"></div>
        `;
        this.renderView();
    },

    renderView() {
        const list = Storage.list(Storage.KEYS.notas)
            .filter(n => !this.state.search ||
                n.numero.toLowerCase().includes(this.state.search.toLowerCase()) ||
                (n.responsable || '').toLowerCase().includes(this.state.search.toLowerCase()));
        const sorted = Helpers.sortBy(list, 'fechaReal', false);
        const fincas = Object.fromEntries(Storage.list(Storage.KEYS.fincas).map(f => [f.id, f]));
        const ordenes = Object.fromEntries(Storage.list(Storage.KEYS.ordenes).map(o => [o.id, o]));

        const ocByNotaId = Object.fromEntries(Storage.list(Storage.KEYS.prefacturas).map(p => [p.notaId, p]));
        const rows = sorted.map(n => {
            const f = fincas[n.fincaId];
            const o = ordenes[n.ordenId];
            const diff = n.pesoReal - (n.cantidadProgramada || o?.cantidad || 0);
            const oc = ocByNotaId[n.id];
            return `
                <tr>
                    <td><strong>${Helpers.escapeHtml(n.numero)}</strong></td>
                    <td>${Helpers.formatDate(n.fechaReal)}</td>
                    <td>${o ? `<small>${Helpers.escapeHtml(o.numero)}</small>` : '-'}</td>
                    <td>${f ? Helpers.escapeHtml(f.nombre) : '-'}</td>
                    <td><span class="badge badge-gray">${n.tipoCacao}</span></td>
                    <td><strong>${Helpers.formatNumber(n.pesoReal)}</strong> kg</td>
                    <td><small class="${diff >= 0 ? 'text-success' : 'text-danger'}">${diff >= 0 ? '+' : ''}${Helpers.formatNumber(diff)}</small></td>
                    <td>${this._calBadge(n.calidadReal)}</td>
                    <td>${oc ? `<a href="#" onclick="App.navigate('prefacturas'); PrefacturasModule.viewDetail('${oc.id}'); return false;"><span class="badge badge-info">${oc.numero}</span></a>` : '<span class="text-muted">—</span>'}</td>
                    <td>${Helpers.escapeHtml(n.responsable || '-')}</td>
                    <td>
                        <div class="row-actions">
                            <button onclick="NotasModule.viewDetail('${n.id}')" title="Ver"><i class="fa-solid fa-eye"></i></button>
                            <button onclick="NotasModule.openEdit('${n.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="PDFGen.notaRecoleccion(Storage.findById(Storage.KEYS.notas,'${n.id}'))" title="PDF nota"><i class="fa-solid fa-file-pdf"></i></button>
                            ${oc ? `<button onclick="App.navigate('prefacturas'); PrefacturasModule.viewDetail('${oc.id}');" title="Ver Orden de Compra"><i class="fa-solid fa-file-invoice-dollar"></i></button>` : ''}
                            <button class="danger" onclick="NotasModule.deleteNota('${n.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('notasView').innerHTML = `
            <div class="table-wrap">
                <div class="table-toolbar">
                    <div class="search-box" style="width:260px;">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Buscar nota o responsable..." value="${Helpers.escapeHtml(this.state.search)}"
                               oninput="NotasModule.state.search=this.value; NotasModule.renderView();">
                    </div>
                    <span class="text-muted" style="margin-left:auto;">${sorted.length} notas</span>
                </div>
                <table class="data-table">
                    <thead><tr><th>Número</th><th>Fecha</th><th>Orden</th><th>Finca</th><th>Tipo</th><th>Peso real</th><th>Δ vs prog.</th><th>Calidad</th><th>Orden de Compra</th><th>Responsable</th><th style="width:180px;">Acciones</th></tr></thead>
                    <tbody>${rows || `<tr><td colspan="11">${UI.emptyState('file-pen','Sin notas','Las notas se generan desde una orden cuando llegas a la finca.')}</td></tr>`}</tbody>
                </table>
            </div>
        `;
    },

    _calBadge(c) {
        const map = { 'Estándar': 'badge-estandar', 'Premium': 'badge-premium', 'Excelencia': 'badge-excelencia' };
        return `<span class="badge ${map[c] || 'badge-gray'}">${c}</span>`;
    },

    // ===== Crear desde una orden =====
    crearDesdeOrden(ordenId) {
        const orden = Storage.findById(Storage.KEYS.ordenes, ordenId);
        if (!orden) {
            UI.toast('Orden no encontrada', 'error');
            return;
        }
        const existing = Storage.list(Storage.KEYS.notas).find(n => n.ordenId === ordenId);
        if (existing) {
            UI.toast(`Esta orden ya tiene la nota ${existing.numero}`, 'warning');
            App.navigate('notas');
            setTimeout(() => this.openEdit(existing.id), 150);
            return;
        }
        // Primero navegar al módulo de Notas (actualiza sidebar/breadcrumb)
        App.navigate('notas');
        // Después abrir el formulario con los datos heredados de la orden
        setTimeout(() => {
            this._openForm({
                ordenId: orden.id,
                fincaId: orden.fincaId,
                tipoCacao: orden.tipoCacao,
                cantidadProgramada: orden.cantidad,
                pesoReal: orden.cantidad,
                calidadReal: orden.calidad,
                clones: orden.clones || [],
                fechaReal: Helpers.today(),
                responsable: '',
                observaciones: orden.observaciones || '',
                _ordenNumero: orden.numero
            }, true);
        }, 150);
    },

    openEdit(id) {
        const n = Storage.findById(Storage.KEYS.notas, id);
        if (!n) return;
        this._openForm(n, false);
    },

    _openForm(nota, isNew) {
        const finca = Storage.findById(Storage.KEYS.fincas, nota.fincaId);
        const orden = Storage.findById(Storage.KEYS.ordenes, nota.ordenId);
        const titleNew = orden ? `Generar nota desde orden ${orden.numero}` : 'Generar nota de recolección';
        UI.openModal({
            title: isNew ? titleNew : `Editar ${nota.numero}`,
            size: 'lg',
            body: `
                <form id="notaForm">
                    <input type="hidden" name="id" value="${nota.id || ''}">
                    <input type="hidden" name="ordenId" value="${nota.ordenId}">
                    <input type="hidden" name="fincaId" value="${nota.fincaId}">
                    <input type="hidden" name="cantidadProgramada" value="${nota.cantidadProgramada || orden?.cantidad || 0}">
                    <input type="hidden" name="clones" value='${JSON.stringify(nota.clones || [])}'>

                    <div class="alert alert-info">
                        <i class="fa-solid fa-circle-info"></i>
                        <div>
                            <strong>Información heredada</strong><br>
                            <small>Orden: ${orden?.numero || '-'} · Finca: ${finca?.nombre || '-'} (${finca?.propietario || '-'})</small><br>
                            <small>Cantidad programada: <strong>${Helpers.formatKg(nota.cantidadProgramada || orden?.cantidad || 0)}</strong></small>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Número</label>
                            <input type="text" name="numero" value="${nota.numero || this.nextNumero()}" readonly>
                        </div>
                        <div class="form-group">
                            <label>Fecha real <span class="req">*</span></label>
                            <input type="date" name="fechaReal" required value="${nota.fechaReal}">
                        </div>
                        <div class="form-group">
                            <label>Tipo cacao</label>
                            <select name="tipoCacao">
                                <option value="Seco" ${nota.tipoCacao === 'Seco' ? 'selected' : ''}>Seco</option>
                                <option value="En baba" ${nota.tipoCacao === 'En baba' ? 'selected' : ''}>En baba</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Peso REAL recolectado (kg) <span class="req">*</span></label>
                            <input type="number" step="0.1" name="pesoReal" required min="0" value="${nota.pesoReal || 0}">
                        </div>
                        <div class="form-group">
                            <label>Calidad real <span class="req">*</span></label>
                            <select name="calidadReal" required>
                                ${['Estándar', 'Premium', 'Excelencia'].map(c => `<option ${nota.calidadReal === c ? 'selected' : ''}>${c}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Responsable</label>
                            <input type="text" name="responsable" value="${Helpers.escapeHtml(nota.responsable || '')}" placeholder="Nombre del recolector">
                        </div>
                        <div class="form-group full">
                            <label>Observaciones finales</label>
                            <textarea name="observaciones">${Helpers.escapeHtml(nota.observaciones || '')}</textarea>
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="NotasModule.save()"><i class="fa-solid fa-check"></i> ${isNew ? 'Crear nota' : 'Actualizar'}</button>
            `
        });
    },

    save() {
        try {
            const formEl = document.getElementById('notaForm');
            if (!formEl) { UI.toast('Formulario no encontrado', 'error'); return; }
            const data = UI.serializeForm(formEl);
            if (!Helpers.isNumber(data.pesoReal)) { UI.toast('Peso real inválido', 'error'); return; }
            if (!data.fechaReal) { UI.toast('Fecha real requerida', 'error'); return; }
            if (!data.ordenId || !data.fincaId) { UI.toast('Datos heredados faltantes (orden/finca)', 'error'); return; }

            let clones = [];
            try { clones = JSON.parse(data.clones || '[]'); } catch (e) { clones = []; }

            const payload = {
                numero: data.numero,
                ordenId: data.ordenId,
                fincaId: data.fincaId,
                fechaReal: data.fechaReal,
                tipoCacao: data.tipoCacao,
                cantidadProgramada: parseFloat(data.cantidadProgramada) || 0,
                pesoReal: parseFloat(data.pesoReal),
                calidadReal: data.calidadReal,
                clones,
                responsable: data.responsable || '',
                observaciones: data.observaciones || ''
            };

            if (data.id) {
                const prev = Storage.findById(Storage.KEYS.notas, data.id);
                const historial = prev?.historial || [];
                const cambios = [];
                if (prev && prev.pesoReal !== payload.pesoReal) cambios.push(`Peso ${prev.pesoReal} → ${payload.pesoReal}`);
                if (prev && prev.calidadReal !== payload.calidadReal) cambios.push(`Calidad ${prev.calidadReal} → ${payload.calidadReal}`);
                if (prev && prev.fechaReal !== payload.fechaReal) cambios.push(`Fecha ${prev.fechaReal} → ${payload.fechaReal}`);
                if (cambios.length) historial.push({ fecha: Helpers.now(), tipo: 'EDICIÓN', detalle: cambios.join(' · ') });
                payload.historial = historial;
                const updated = Storage.update(Storage.KEYS.notas, data.id, payload);
                // AUDIT
                const auditChanges = Audit.diff(prev, updated, ['fechaReal','tipoCacao','pesoReal','calidadReal','responsable','observaciones']);
                if (auditChanges.length) {
                    Audit.log({ entityType: 'nota', entityId: data.id, entityNumero: updated.numero,
                        action: 'editar', details: `${auditChanges.length} campo(s) modificado(s)`, changes: auditChanges });
                }
                UI.closeModal();
                UI.toast('Nota actualizada', 'success');
                this.render();
            } else {
                const ordenRef = Storage.findById(Storage.KEYS.ordenes, payload.ordenId);
                payload.historial = [{ fecha: Helpers.now(), tipo: 'CREACIÓN', detalle: 'Nota creada desde orden ' + (ordenRef?.numero || payload.ordenId) }];
                const created = Storage.add(Storage.KEYS.notas, payload);
                // Marcar orden como Recolectada
                Storage.update(Storage.KEYS.ordenes, payload.ordenId, { estado: 'Recolectada' });
                // AUDIT: creación de nota
                Audit.log({ entityType: 'nota', entityId: created.id, entityNumero: created.numero,
                    action: 'crear',
                    details: `Nota generada desde orden ${ordenRef?.numero || ''} · Peso real: ${created.pesoReal} kg · Calidad: ${created.calidadReal}`,
                    changes: [
                        { field: 'pesoReal', before: null, after: created.pesoReal },
                        { field: 'calidadReal', before: null, after: created.calidadReal }
                    ] });
                // AUDIT: cambio de estado de la orden
                Audit.log({ entityType: 'orden', entityId: payload.ordenId, entityNumero: ordenRef?.numero,
                    action: 'estado', details: `Estado: ${ordenRef?.estado || '?'} → Recolectada`,
                    changes: [{ field: 'estado', before: ordenRef?.estado, after: 'Recolectada' }] });
                // Generar Orden de Compra automáticamente
                const oc = PrefacturasModule.generarDesdeNota(created);
                UI.closeModal();
                UI.toast(`Nota ${created.numero} creada · OC ${oc.numero} generada`, 'success');
                this.render();
            }
        } catch (err) {
            console.error('Error en NotasModule.save', err);
            UI.toast('Error al guardar la nota: ' + (err.message || 'desconocido'), 'error');
        }
    },

    viewDetail(id) {
        const n = Storage.findById(Storage.KEYS.notas, id);
        const f = Storage.findById(Storage.KEYS.fincas, n.fincaId);
        const o = Storage.findById(Storage.KEYS.ordenes, n.ordenId);
        const diff = n.pesoReal - (n.cantidadProgramada || 0);

        UI.openModal({
            title: `Nota ${n.numero}`,
            size: 'lg',
            body: `
                <div class="grid-2">
                    <div>
                        <h4 style="color:var(--cacao-700);">Datos de la nota</h4>
                        <p><strong>Número:</strong> ${n.numero}</p>
                        <p><strong>Fecha real:</strong> ${Helpers.formatDate(n.fechaReal)}</p>
                        <p><strong>Tipo:</strong> ${n.tipoCacao}</p>
                        <p><strong>Cantidad programada:</strong> ${Helpers.formatKg(n.cantidadProgramada)}</p>
                        <p><strong>Peso real:</strong> ${Helpers.formatKg(n.pesoReal)} <small class="${diff >= 0 ? 'text-success' : 'text-danger'}">(${diff >= 0 ? '+' : ''}${diff} kg)</small></p>
                        <p><strong>Calidad real:</strong> ${this._calBadge(n.calidadReal)}</p>
                        <p><strong>Responsable:</strong> ${Helpers.escapeHtml(n.responsable || '-')}</p>
                        <p><strong>Observaciones:</strong> ${Helpers.escapeHtml(n.observaciones || '-')}</p>
                        <p><strong>Orden:</strong> ${o?.numero || '-'}</p>
                        <p><strong>Finca:</strong> ${f?.nombre || '-'}</p>
                    </div>
                    <div>
                        <h4 style="color:var(--cacao-700); margin-bottom:12px;"><i class="fa-solid fa-clock-rotate-left"></i> Historial de cambios (auditoría)</h4>
                        <div style="max-height:300px; overflow-y:auto;">
                            ${Audit.renderTimeline(Audit.list({ entityId: n.id }))}
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cerrar</button>
                <button class="btn btn-outline" onclick="PDFGen.notaRecoleccion(Storage.findById(Storage.KEYS.notas,'${n.id}'))"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                <button class="btn btn-primary" onclick="NotasModule.openEdit('${n.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
            `
        });
    },

    async deleteNota(id) {
        const ok = await UI.confirm({ title: '¿Eliminar nota?', message: 'También se eliminará la Orden de Compra asociada.' });
        if (!ok) return;
        const n = Storage.findById(Storage.KEYS.notas, id);
        const pref = Storage.list(Storage.KEYS.prefacturas).find(p => p.notaId === id);
        if (pref) {
            Storage.remove_item(Storage.KEYS.prefacturas, pref.id);
            Audit.log({ entityType: 'prefactura', entityId: pref.id, entityNumero: pref.numero,
                action: 'eliminar', details: `Eliminada en cascada al borrar nota ${n?.numero}`, changes: [] });
        }
        Storage.remove_item(Storage.KEYS.notas, id);
        if (n) Audit.log({ entityType: 'nota', entityId: id, entityNumero: n.numero,
            action: 'eliminar', details: 'Nota eliminada', changes: [] });
        UI.toast('Nota eliminada', 'success');
        this.render();
    },

    exportExcel() {
        const list = Storage.list(Storage.KEYS.notas);
        const fincas = Object.fromEntries(Storage.list(Storage.KEYS.fincas).map(f => [f.id, f]));
        const ws = XLSX.utils.json_to_sheet(list.map(n => ({
            Número: n.numero, Fecha: n.fechaReal, Finca: fincas[n.fincaId]?.nombre,
            Tipo: n.tipoCacao, Programado: n.cantidadProgramada, Real: n.pesoReal,
            Calidad: n.calidadReal, Responsable: n.responsable, Observaciones: n.observaciones
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Notas');
        XLSX.writeFile(wb, 'Notas_SmartCacao.xlsx');
        UI.toast('Excel descargado', 'success');
    }
};
