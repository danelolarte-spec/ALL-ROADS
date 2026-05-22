/* ================================================================
   modules/fincas.js — Gestión de Fincas (CRUD + mapa + cards)
================================================================ */

const FincasModule = {

    state: { view: 'tabla', search: '', sortKey: 'nombre', sortAsc: true, map: null },

    render() {
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Gestión de Fincas', 'Administra las fincas productoras de cacao', `
                <button class="btn btn-outline" onclick="FincasModule.exportExcel()">
                    <i class="fa-solid fa-file-excel"></i> Excel
                </button>
                <button class="btn btn-primary" onclick="FincasModule.openForm()">
                    <i class="fa-solid fa-plus"></i> Nueva finca
                </button>
            `)}

            <div class="tabs">
                <button class="tab ${this.state.view === 'tabla' ? 'active' : ''}" onclick="FincasModule.switchView('tabla')">
                    <i class="fa-solid fa-table"></i> Tabla
                </button>
                <button class="tab ${this.state.view === 'tarjetas' ? 'active' : ''}" onclick="FincasModule.switchView('tarjetas')">
                    <i class="fa-solid fa-grip"></i> Tarjetas
                </button>
                <button class="tab ${this.state.view === 'mapa' ? 'active' : ''}" onclick="FincasModule.switchView('mapa')">
                    <i class="fa-solid fa-map-location-dot"></i> Mapa
                </button>
                <button class="tab ${this.state.view === 'clones' ? 'active' : ''}" onclick="FincasModule.switchView('clones')">
                    <i class="fa-solid fa-dna"></i> Clones
                </button>
            </div>

            <div id="fincasView"></div>
        `;
        this.renderView();
    },

    switchView(v) { this.state.view = v; this.render(); },

    renderView() {
        const target = document.getElementById('fincasView');
        if (this.state.view === 'tabla') target.innerHTML = this.renderTable();
        if (this.state.view === 'tarjetas') target.innerHTML = this.renderCards();
        if (this.state.view === 'clones') target.innerHTML = this.renderClones();
        if (this.state.view === 'mapa') {
            target.innerHTML = `<div class="card"><div class="card-body" style="padding:0;"><div id="fincasMap" class="map-container"></div></div></div>`;
            setTimeout(() => this.renderMap(), 80);
        }
    },

    _filtered() {
        const fincas = Storage.list(Storage.KEYS.fincas);
        const s = this.state.search.toLowerCase();
        let out = fincas.filter(f =>
            !s || f.nombre.toLowerCase().includes(s) ||
            f.propietario.toLowerCase().includes(s) ||
            f.vereda.toLowerCase().includes(s) ||
            (f.cedula || '').includes(s)
        );
        out = Helpers.sortBy(out, this.state.sortKey, this.state.sortAsc);
        return out;
    },

    renderTable() {
        const fincas = this._filtered();
        const rows = fincas.map(f => `
            <tr>
                <td><strong>${Helpers.escapeHtml(f.codigo || '-')}</strong></td>
                <td><strong>${Helpers.escapeHtml(f.nombre)}</strong><br><span class="text-muted" style="font-size:11px;">${Helpers.escapeHtml(f.vereda)}</span></td>
                <td>${Helpers.escapeHtml(f.propietario)}<br><span class="text-muted" style="font-size:11px;">CC ${Helpers.escapeHtml(f.cedula || '-')}</span></td>
                <td>${Helpers.escapeHtml(f.municipio)}, ${Helpers.escapeHtml(f.departamento)}</td>
                <td>${f.hectareasProductivas} ha<br><span class="text-muted" style="font-size:11px;">${f.areaSembrada} sembrada</span></td>
                <td>${(f.clones || []).map(c => `<span class="badge badge-cacao">${Helpers.escapeHtml(c)}</span>`).join(' ')}</td>
                <td>
                    <div class="row-actions">
                        <button onclick="FincasModule.openForm('${f.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="FincasModule.viewDetail('${f.id}')" title="Ver"><i class="fa-solid fa-eye"></i></button>
                        <button class="danger" onclick="FincasModule.deleteFinca('${f.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        return `
            <div class="table-wrap">
                <div class="table-toolbar">
                    <div class="search-box" style="width:280px;">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" placeholder="Buscar finca, propietario, vereda..." value="${Helpers.escapeHtml(this.state.search)}"
                               oninput="FincasModule.state.search=this.value; document.getElementById('fincasView').innerHTML = FincasModule.renderTable();">
                    </div>
                    <span class="text-muted">${fincas.length} fincas</span>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th onclick="FincasModule.sort('codigo')">Código</th>
                            <th onclick="FincasModule.sort('nombre')">Finca</th>
                            <th onclick="FincasModule.sort('propietario')">Propietario</th>
                            <th>Ubicación</th>
                            <th onclick="FincasModule.sort('hectareasProductivas')">Hectáreas</th>
                            <th>Clones</th>
                            <th style="width:130px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${rows || `<tr><td colspan="7">${UI.emptyState('tree', 'Sin fincas', 'Aún no hay fincas registradas.')}</td></tr>`}</tbody>
                </table>
            </div>
        `;
    },

    renderCards() {
        const fincas = this._filtered();
        if (!fincas.length) return UI.emptyState('tree', 'Sin fincas', 'Aún no hay fincas registradas.');
        const cards = fincas.map(f => `
            <div class="finca-card">
                <div class="finca-card-header">
                    <div>
                        <h3>${Helpers.escapeHtml(f.nombre)}</h3>
                        <span><i class="fa-solid fa-location-dot"></i> ${Helpers.escapeHtml(f.vereda)}</span>
                    </div>
                    <span style="background:rgba(255,255,255,0.2); padding:4px 10px; border-radius:999px; font-size:11px;">${Helpers.escapeHtml(f.codigo || '')}</span>
                </div>
                <div class="finca-card-body">
                    <div class="finca-card-row"><i class="fa-solid fa-user"></i> Propietario <strong>${Helpers.escapeHtml(f.propietario)}</strong></div>
                    <div class="finca-card-row"><i class="fa-solid fa-id-card"></i> Cédula <strong>${Helpers.escapeHtml(f.cedula)}</strong></div>
                    <div class="finca-card-row"><i class="fa-solid fa-phone"></i> Teléfono <strong>${Helpers.escapeHtml(f.telefono)}</strong></div>
                    <div class="finca-card-row"><i class="fa-solid fa-ruler-combined"></i> Productivas <strong>${f.hectareasProductivas} ha</strong></div>
                    <div class="finca-card-row" style="flex-wrap:wrap;">
                        <i class="fa-solid fa-dna"></i>
                        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-left:auto;">
                            ${(f.clones || []).map(c => `<span class="badge badge-cacao">${Helpers.escapeHtml(c)}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="finca-card-footer">
                    <button class="btn btn-sm btn-ghost" onclick="FincasModule.viewDetail('${f.id}')"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn btn-sm btn-outline" onclick="FincasModule.openForm('${f.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="FincasModule.deleteFinca('${f.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        return `<div class="grid-3">${cards}</div>`;
    },

    renderMap() {
        const fincas = Storage.list(Storage.KEYS.fincas);
        const config = Storage.get(Storage.KEYS.config);
        const punto = config.puntoSalida;
        if (this.state.map) { this.state.map.remove(); this.state.map = null; }
        const map = L.map('fincasMap').setView([punto.lat, punto.lng], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap', maxZoom: 19
        }).addTo(map);

        // Punto salida
        const homeIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background:#7a4f2a; color:white; width:32px; height:32px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,.3);"><i class="fa-solid fa-warehouse" style="transform:rotate(45deg);"></i></div>',
            iconSize: [32, 32], iconAnchor: [16, 32]
        });
        L.marker([punto.lat, punto.lng], { icon: homeIcon })
            .addTo(map)
            .bindPopup(`<strong>${punto.nombre}</strong><br>Punto de salida`);

        fincas.forEach(f => {
            const icon = L.divIcon({
                className: 'finca-marker',
                html: '<div style="background:#3b7a48; color:white; width:28px; height:28px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,.3);"><i class="fa-solid fa-tree" style="transform:rotate(45deg); font-size:11px;"></i></div>',
                iconSize: [28, 28], iconAnchor: [14, 28]
            });
            L.marker([f.lat, f.lng], { icon }).addTo(map).bindPopup(`
                <strong>${Helpers.escapeHtml(f.nombre)}</strong><br>
                ${Helpers.escapeHtml(f.propietario)}<br>
                <small>${Helpers.escapeHtml(f.vereda)}, ${Helpers.escapeHtml(f.municipio)}</small><br>
                <small>${f.hectareasProductivas} ha productivas</small>
            `);
        });
        this.state.map = map;
    },

    renderClones() {
        const clones = Storage.list(Storage.KEYS.clones);
        const rows = clones.map(c => `
            <tr>
                <td><strong>${Helpers.escapeHtml(c.nombre)}</strong></td>
                <td>${Helpers.escapeHtml(c.descripcion || '')}</td>
                <td>${c.custom ? '<span class="badge badge-info">Personalizado</span>' : '<span class="badge badge-gray">Estándar</span>'}</td>
                <td>
                    <div class="row-actions">
                        ${c.custom ? `<button class="danger" onclick="FincasModule.deleteClone('${c.id}')"><i class="fa-solid fa-trash"></i></button>` : '<span class="text-muted">—</span>'}
                    </div>
                </td>
            </tr>
        `).join('');
        return `
            <div class="table-wrap">
                <div class="table-toolbar">
                    <strong>Catálogo de clones</strong>
                    <span class="text-muted" style="margin-left:auto;">${clones.length} clones</span>
                    <button class="btn btn-primary btn-sm" onclick="FincasModule.openCloneForm()"><i class="fa-solid fa-plus"></i> Nuevo clon</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>Nombre</th><th>Descripción</th><th>Tipo</th><th style="width:80px;">Acciones</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    openCloneForm() {
        UI.openModal({
            title: 'Nuevo clon de cacao',
            body: `
                <form id="cloneForm">
                    <div class="form-grid">
                        <div class="form-group full">
                            <label>Nombre del clon <span class="req">*</span></label>
                            <input type="text" name="nombre" required maxlength="40" placeholder="Ej: NUEVO-CLON-01">
                        </div>
                        <div class="form-group full">
                            <label>Descripción</label>
                            <input type="text" name="descripcion" placeholder="Descripción opcional">
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="FincasModule.saveClone()"><i class="fa-solid fa-check"></i> Guardar</button>
            `
        });
    },

    saveClone() {
        const form = document.getElementById('cloneForm');
        const data = UI.serializeForm(form);
        if (!Helpers.required(data.nombre)) { UI.toast('El nombre es obligatorio', 'error'); return; }
        const existing = Storage.list(Storage.KEYS.clones).find(c => c.nombre.toLowerCase() === data.nombre.toLowerCase());
        if (existing) { UI.toast('Ya existe un clon con ese nombre', 'warning'); return; }
        Storage.add(Storage.KEYS.clones, { nombre: data.nombre.trim().toUpperCase(), descripcion: data.descripcion, custom: true });
        UI.closeModal();
        UI.toast('Clon creado correctamente', 'success');
        this.render();
    },

    async deleteClone(id) {
        const ok = await UI.confirm({ title: '¿Eliminar clon?', message: 'Esta acción es irreversible.' });
        if (!ok) return;
        Storage.remove_item(Storage.KEYS.clones, id);
        UI.toast('Clon eliminado', 'success');
        this.render();
    },

    sort(key) {
        if (this.state.sortKey === key) this.state.sortAsc = !this.state.sortAsc;
        else { this.state.sortKey = key; this.state.sortAsc = true; }
        this.renderView();
    },

    // ============== FORM ==============
    openForm(id = null) {
        const isEdit = !!id;
        const finca = isEdit ? Storage.findById(Storage.KEYS.fincas, id) : {};
        const clones = Storage.list(Storage.KEYS.clones);
        const selectedClones = (finca.clones || []);

        UI.openModal({
            title: isEdit ? 'Editar finca' : 'Nueva finca',
            size: 'lg',
            body: `
                <form id="fincaForm">
                    <input type="hidden" name="id" value="${finca.id || ''}">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Código</label>
                            <input type="text" name="codigo" value="${Helpers.escapeHtml(finca.codigo || '')}" placeholder="Auto si vacío">
                        </div>
                        <div class="form-group">
                            <label>Nombre de la finca <span class="req">*</span></label>
                            <input type="text" name="nombre" required value="${Helpers.escapeHtml(finca.nombre || '')}">
                        </div>
                        <div class="form-group">
                            <label>Latitud <span class="req">*</span></label>
                            <input type="number" step="0.0001" name="lat" required value="${finca.lat || ''}" placeholder="7.0292">
                        </div>
                        <div class="form-group">
                            <label>Longitud <span class="req">*</span></label>
                            <input type="number" step="0.0001" name="lng" required value="${finca.lng || ''}" placeholder="-71.4475">
                        </div>
                        <div class="form-group">
                            <label>Departamento <span class="req">*</span></label>
                            <input type="text" name="departamento" required value="${Helpers.escapeHtml(finca.departamento || 'Arauca')}">
                        </div>
                        <div class="form-group">
                            <label>Municipio <span class="req">*</span></label>
                            <input type="text" name="municipio" required value="${Helpers.escapeHtml(finca.municipio || 'Arauquita')}">
                        </div>
                        <div class="form-group">
                            <label>Vereda <span class="req">*</span></label>
                            <input type="text" name="vereda" required value="${Helpers.escapeHtml(finca.vereda || '')}">
                        </div>
                        <div class="form-group">
                            <label>Propietario <span class="req">*</span></label>
                            <input type="text" name="propietario" required value="${Helpers.escapeHtml(finca.propietario || '')}">
                        </div>
                        <div class="form-group">
                            <label>Cédula <span class="req">*</span></label>
                            <input type="text" name="cedula" required value="${Helpers.escapeHtml(finca.cedula || '')}">
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="text" name="telefono" value="${Helpers.escapeHtml(finca.telefono || '')}">
                        </div>
                        <div class="form-group">
                            <label>Área sembrada (ha)</label>
                            <input type="number" step="0.1" name="areaSembrada" value="${finca.areaSembrada || ''}">
                        </div>
                        <div class="form-group">
                            <label>Hectáreas productivas</label>
                            <input type="number" step="0.1" name="hectareasProductivas" value="${finca.hectareasProductivas || ''}">
                        </div>
                        <div class="form-group full">
                            <label>Clones sembrados</label>
                            <div class="chip-input" id="chipsContainer">
                                ${selectedClones.map(c => `<span class="chip">${Helpers.escapeHtml(c)} <button type="button" onclick="FincasModule._removeChip('${c}')"><i class="fa-solid fa-xmark"></i></button></span>`).join('')}
                            </div>
                            <div class="chip-select" style="margin-top:8px;">
                                <select id="cloneSelect">
                                    <option value="">— Selecciona un clon —</option>
                                    ${clones.map(c => `<option value="${Helpers.escapeHtml(c.nombre)}">${Helpers.escapeHtml(c.nombre)}</option>`).join('')}
                                </select>
                                <button type="button" class="btn btn-sm btn-outline" onclick="FincasModule._addChip()"><i class="fa-solid fa-plus"></i> Añadir</button>
                                <button type="button" class="btn btn-sm btn-ghost" onclick="FincasModule._newCloneFromForm()"><i class="fa-solid fa-circle-plus"></i> Nuevo clon</button>
                            </div>
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="FincasModule.save()"><i class="fa-solid fa-check"></i> ${isEdit ? 'Actualizar' : 'Crear'}</button>
            `
        });

        // Guardar selección inicial en estado del form
        this._formChips = [...selectedClones];
    },

    _addChip() {
        const sel = document.getElementById('cloneSelect');
        const val = sel.value;
        if (!val) return;
        if (this._formChips.includes(val)) { UI.toast('Ya está seleccionado', 'warning'); return; }
        this._formChips.push(val);
        this._renderChips();
        sel.value = '';
    },

    _removeChip(clone) {
        this._formChips = this._formChips.filter(c => c !== clone);
        this._renderChips();
    },

    _renderChips() {
        const c = document.getElementById('chipsContainer');
        if (!c) return;
        c.innerHTML = this._formChips.map(cl => `<span class="chip">${Helpers.escapeHtml(cl)} <button type="button" onclick="FincasModule._removeChip('${cl}')"><i class="fa-solid fa-xmark"></i></button></span>`).join('');
    },

    _newCloneFromForm() {
        const nombre = prompt('Nombre del nuevo clon:');
        if (!nombre || !nombre.trim()) return;
        const n = nombre.trim().toUpperCase();
        const existing = Storage.list(Storage.KEYS.clones).find(c => c.nombre.toUpperCase() === n);
        if (existing) { UI.toast('Ya existe', 'warning'); return; }
        Storage.add(Storage.KEYS.clones, { nombre: n, descripcion: 'Personalizado', custom: true });
        const sel = document.getElementById('cloneSelect');
        const opt = document.createElement('option');
        opt.value = n; opt.textContent = n;
        sel.appendChild(opt);
        sel.value = n;
        this._addChip();
        UI.toast('Clon agregado', 'success');
    },

    save() {
        const form = document.getElementById('fincaForm');
        const data = UI.serializeForm(form);

        if (!Helpers.required(data.nombre) || !Helpers.required(data.propietario) || !Helpers.required(data.cedula)) {
            UI.toast('Completa los campos obligatorios', 'error');
            return;
        }
        if (!Helpers.isNumber(data.lat) || !Helpers.isNumber(data.lng)) {
            UI.toast('Coordenadas inválidas', 'error');
            return;
        }

        const payload = {
            codigo: data.codigo || ('FIN-' + Date.now().toString().slice(-4)),
            nombre: data.nombre.trim(),
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
            departamento: data.departamento,
            municipio: data.municipio,
            vereda: data.vereda,
            propietario: data.propietario,
            cedula: data.cedula,
            telefono: data.telefono || '',
            areaSembrada: parseFloat(data.areaSembrada) || 0,
            hectareasProductivas: parseFloat(data.hectareasProductivas) || 0,
            clones: [...this._formChips]
        };

        if (data.id) {
            Storage.update(Storage.KEYS.fincas, data.id, payload);
            UI.toast('Finca actualizada', 'success');
        } else {
            Storage.add(Storage.KEYS.fincas, payload);
            UI.toast('Finca creada', 'success');
        }
        UI.closeModal();
        this.render();
    },

    viewDetail(id) {
        const f = Storage.findById(Storage.KEYS.fincas, id);
        if (!f) return;
        UI.openModal({
            title: f.nombre,
            size: 'lg',
            body: `
                <div class="grid-2">
                    <div>
                        <h4 style="margin-bottom:8px; color:var(--cacao-700);"><i class="fa-solid fa-user"></i> Propietario</h4>
                        <p>${Helpers.escapeHtml(f.propietario)}<br>
                        <small class="text-muted">CC ${Helpers.escapeHtml(f.cedula)} • ${Helpers.escapeHtml(f.telefono)}</small></p>

                        <h4 style="margin-top:16px; margin-bottom:8px; color:var(--cacao-700);"><i class="fa-solid fa-location-dot"></i> Ubicación</h4>
                        <p>${Helpers.escapeHtml(f.vereda)}, ${Helpers.escapeHtml(f.municipio)}<br>
                        <small class="text-muted">${Helpers.escapeHtml(f.departamento)}</small><br>
                        <small class="text-muted">Coord: ${f.lat}, ${f.lng}</small></p>

                        <h4 style="margin-top:16px; margin-bottom:8px; color:var(--cacao-700);"><i class="fa-solid fa-ruler-combined"></i> Áreas</h4>
                        <p>Sembrada: <strong>${f.areaSembrada} ha</strong><br>
                        Productiva: <strong>${f.hectareasProductivas} ha</strong></p>

                        <h4 style="margin-top:16px; margin-bottom:8px; color:var(--cacao-700);"><i class="fa-solid fa-dna"></i> Clones</h4>
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">
                            ${(f.clones || []).map(c => `<span class="badge badge-cacao">${Helpers.escapeHtml(c)}</span>`).join('')}
                        </div>
                    </div>
                    <div>
                        <div id="fincaDetailMap" class="map-container sm"></div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cerrar</button>
                <button class="btn btn-secondary" onclick="HistoricoModule.openFinca('${f.id}'); UI.closeModal();"><i class="fa-solid fa-chart-line"></i> Ver histórico</button>
                <button class="btn btn-primary" onclick="FincasModule.openForm('${f.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
            `
        });
        setTimeout(() => {
            const map = L.map('fincaDetailMap').setView([f.lat, f.lng], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
            L.marker([f.lat, f.lng]).addTo(map).bindPopup(f.nombre).openPopup();
        }, 120);
    },

    async deleteFinca(id) {
        const ok = await UI.confirm({ title: '¿Eliminar finca?', message: 'Se eliminará también su histórico relacionado.' });
        if (!ok) return;
        Storage.remove_item(Storage.KEYS.fincas, id);
        UI.toast('Finca eliminada', 'success');
        this.render();
    },

    exportExcel() {
        const fincas = Storage.list(Storage.KEYS.fincas);
        const ws = XLSX.utils.json_to_sheet(fincas.map(f => ({
            Código: f.codigo, Nombre: f.nombre, Propietario: f.propietario, Cédula: f.cedula,
            Teléfono: f.telefono, Departamento: f.departamento, Municipio: f.municipio, Vereda: f.vereda,
            Latitud: f.lat, Longitud: f.lng, AreaSembrada: f.areaSembrada,
            HectareasProductivas: f.hectareasProductivas, Clones: (f.clones || []).join(', ')
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Fincas');
        XLSX.writeFile(wb, 'Fincas_CacaoFlow.xlsx');
        UI.toast('Excel descargado', 'success');
    }
};
