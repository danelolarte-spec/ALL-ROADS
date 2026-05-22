/* ================================================================
   modules/vehiculos.js — Gestión de Vehículos (CRUD + semáforos)
================================================================ */

const VehiculosModule = {

    state: { search: '' },

    render() {
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Vehículos', 'Flota de transporte y documentación', `
                <button class="btn btn-outline" onclick="VehiculosModule.exportExcel()"><i class="fa-solid fa-file-excel"></i> Excel</button>
                <button class="btn btn-primary" onclick="VehiculosModule.openForm()"><i class="fa-solid fa-plus"></i> Nuevo vehículo</button>
            `)}
            <div id="vehView"></div>
        `;
        this.renderView();
    },

    renderView() {
        const list = Storage.list(Storage.KEYS.vehiculos)
            .filter(v => !this.state.search || v.placa.toLowerCase().includes(this.state.search.toLowerCase()) || v.marca.toLowerCase().includes(this.state.search.toLowerCase()));

        const cards = list.map(v => {
            const soat = Helpers.docStatus(v.soatVence);
            const tec = Helpers.docStatus(v.tecnoVence);
            return `
                <div class="card">
                    <div class="card-header" style="background:linear-gradient(90deg, var(--cacao-100), transparent);">
                        <div>
                            <div class="card-title"><i class="fa-solid fa-truck"></i> ${Helpers.escapeHtml(v.placa)}</div>
                            <div class="card-subtitle">${Helpers.escapeHtml(v.marca)} ${Helpers.escapeHtml(v.modelo)}</div>
                        </div>
                        <span class="badge badge-cacao">${Helpers.formatKg(v.capacidad)}</span>
                    </div>
                    <div class="card-body">
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <div><i class="fa-solid fa-user" style="color:var(--cacao-600); width:18px;"></i> ${Helpers.escapeHtml(v.propietario)}</div>
                            <div>
                                <strong>SOAT:</strong> ${Helpers.escapeHtml(v.soatNumero || '-')}<br>
                                <small><span class="status-dot ${soat.color}"></span>${soat.label} ${soat.days !== null ? `(${soat.days >= 0 ? 'vence en ' + soat.days + ' días' : 'hace ' + Math.abs(soat.days) + ' días'})` : ''}</small><br>
                                <small class="text-muted">Vence: ${Helpers.formatDate(v.soatVence)}</small>
                            </div>
                            <div>
                                <strong>Tecnomecánica:</strong> ${Helpers.escapeHtml(v.tecnoNumero || '-')}<br>
                                <small><span class="status-dot ${tec.color}"></span>${tec.label} ${tec.days !== null ? `(${tec.days >= 0 ? 'vence en ' + tec.days + ' días' : 'hace ' + Math.abs(tec.days) + ' días'})` : ''}</small><br>
                                <small class="text-muted">Vence: ${Helpers.formatDate(v.tecnoVence)}</small>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer" style="display:flex; gap:6px; justify-content:flex-end;">
                        <button class="btn btn-sm btn-outline" onclick="VehiculosModule.openForm('${v.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="VehiculosModule.deleteVeh('${v.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('vehView').innerHTML = `
            <div class="table-wrap mb-3">
                <div class="table-toolbar">
                    <div class="search-box" style="width:300px;">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Buscar por placa o marca..." value="${Helpers.escapeHtml(this.state.search)}"
                               oninput="VehiculosModule.state.search=this.value; VehiculosModule.renderView();">
                    </div>
                    <span class="text-muted" style="margin-left:auto;">${list.length} vehículos</span>
                </div>
            </div>
            ${list.length ? `<div class="grid-3">${cards}</div>` : UI.emptyState('truck', 'Sin vehículos', 'Registra el primer vehículo de la flota.')}
        `;
    },

    openForm(id = null) {
        const isEdit = !!id;
        const v = isEdit ? Storage.findById(Storage.KEYS.vehiculos, id) : {};
        UI.openModal({
            title: isEdit ? `Editar ${v.placa}` : 'Nuevo vehículo',
            size: 'lg',
            body: `
                <form id="vehForm">
                    <input type="hidden" name="id" value="${v.id || ''}">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Placa <span class="req">*</span></label>
                            <input type="text" name="placa" required value="${Helpers.escapeHtml(v.placa || '')}" style="text-transform:uppercase;">
                        </div>
                        <div class="form-group">
                            <label>Marca <span class="req">*</span></label>
                            <input type="text" name="marca" required value="${Helpers.escapeHtml(v.marca || '')}">
                        </div>
                        <div class="form-group">
                            <label>Modelo <span class="req">*</span></label>
                            <input type="text" name="modelo" required value="${Helpers.escapeHtml(v.modelo || '')}">
                        </div>
                        <div class="form-group">
                            <label>Capacidad (kg) <span class="req">*</span></label>
                            <input type="number" name="capacidad" required min="1" value="${v.capacidad || ''}">
                        </div>
                        <div class="form-group full">
                            <label>Propietario <span class="req">*</span></label>
                            <input type="text" name="propietario" required value="${Helpers.escapeHtml(v.propietario || '')}">
                        </div>
                        <div class="form-group">
                            <label>SOAT - Número</label>
                            <input type="text" name="soatNumero" value="${Helpers.escapeHtml(v.soatNumero || '')}">
                        </div>
                        <div class="form-group">
                            <label>SOAT - Vencimiento</label>
                            <input type="date" name="soatVence" value="${v.soatVence || ''}">
                        </div>
                        <div class="form-group">
                            <label>Tecnomecánica - Número</label>
                            <input type="text" name="tecnoNumero" value="${Helpers.escapeHtml(v.tecnoNumero || '')}">
                        </div>
                        <div class="form-group">
                            <label>Tecnomecánica - Vencimiento</label>
                            <input type="date" name="tecnoVence" value="${v.tecnoVence || ''}">
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="VehiculosModule.save()"><i class="fa-solid fa-check"></i> ${isEdit ? 'Actualizar' : 'Crear'}</button>
            `
        });
    },

    save() {
        const data = UI.serializeForm(document.getElementById('vehForm'));
        if (!data.placa || !data.marca || !data.capacidad) { UI.toast('Completa los campos requeridos', 'error'); return; }
        const payload = {
            placa: data.placa.toUpperCase().trim(),
            marca: data.marca, modelo: data.modelo,
            propietario: data.propietario,
            capacidad: parseFloat(data.capacidad),
            soatNumero: data.soatNumero, soatVence: data.soatVence,
            tecnoNumero: data.tecnoNumero, tecnoVence: data.tecnoVence
        };
        if (data.id) {
            Storage.update(Storage.KEYS.vehiculos, data.id, payload);
            UI.toast('Vehículo actualizado', 'success');
        } else {
            Storage.add(Storage.KEYS.vehiculos, payload);
            UI.toast('Vehículo creado', 'success');
        }
        UI.closeModal();
        this.render();
    },

    async deleteVeh(id) {
        const ok = await UI.confirm({ title: '¿Eliminar vehículo?', message: 'Las rutas asignadas podrían quedar sin vehículo.' });
        if (!ok) return;
        Storage.remove_item(Storage.KEYS.vehiculos, id);
        UI.toast('Vehículo eliminado', 'success');
        this.render();
    },

    exportExcel() {
        const list = Storage.list(Storage.KEYS.vehiculos);
        const ws = XLSX.utils.json_to_sheet(list.map(v => ({
            Placa: v.placa, Marca: v.marca, Modelo: v.modelo, Propietario: v.propietario,
            Capacidad_kg: v.capacidad, SOAT_Numero: v.soatNumero, SOAT_Vence: v.soatVence,
            Tecno_Numero: v.tecnoNumero, Tecno_Vence: v.tecnoVence
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Vehiculos');
        XLSX.writeFile(wb, 'Vehiculos_SmartCacao.xlsx');
        UI.toast('Excel descargado', 'success');
    }
};
