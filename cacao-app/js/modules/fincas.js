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
            // Polígono área total
            if (f.poligonoTotal && f.poligonoTotal.length >= 3) {
                L.polygon(f.poligonoTotal, {
                    color: '#f59e0b', weight: 2, dashArray: '6,4',
                    fillColor: '#fbbf24', fillOpacity: 0.08
                }).addTo(map).bindTooltip(`${f.nombre} - Área total: ${Helpers.polygonAreaHa(f.poligonoTotal).toFixed(2)} ha`);
            }
            // Polígono área sembrada
            if (f.poligonoSembrado && f.poligonoSembrado.length >= 3) {
                L.polygon(f.poligonoSembrado, {
                    color: '#3b7a48', weight: 2,
                    fillColor: '#6bb377', fillOpacity: 0.30
                }).addTo(map).bindTooltip(`${f.nombre} - Sembrado: ${Helpers.polygonAreaHa(f.poligonoSembrado).toFixed(2)} ha`);
            }

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

        // Leyenda del mapa
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <div style="background:white; padding:8px 12px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,.15); font-size:11px;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                        <span style="display:inline-block; width:14px; height:14px; border:2px dashed #f59e0b; background:rgba(251,191,36,.12);"></span> Área total
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="display:inline-block; width:14px; height:14px; border:2px solid #3b7a48; background:rgba(107,179,119,.35);"></span> Área sembrada
                    </div>
                </div>
            `;
            return div;
        };
        legend.addTo(map);

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
                        <div class="form-group full">
                            <label>Polígonos del terreno (área total y área sembrada)</label>
                            <div class="poly-summary" id="polySummary">
                                <div class="poly-summary-item">
                                    <i class="fa-solid fa-draw-polygon" style="color:#f59e0b;"></i>
                                    <span>Área total: <strong id="sumAreaTotal">— ha</strong></span>
                                    <small id="sumPtsTotal" class="text-muted">0 puntos</small>
                                </div>
                                <div class="poly-summary-item">
                                    <i class="fa-solid fa-seedling" style="color:#3b7a48;"></i>
                                    <span>Área sembrada: <strong id="sumAreaSembrada">— ha</strong></span>
                                    <small id="sumPtsSembrada" class="text-muted">0 puntos</small>
                                </div>
                                <button type="button" class="btn btn-primary btn-sm" onclick="FincasModule.openPolygonEditor()">
                                    <i class="fa-solid fa-map"></i> Editar polígonos en mapa
                                </button>
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
        this._formPolyTotal = finca.poligonoTotal ? finca.poligonoTotal.map(p => [...p]) : [];
        this._formPolySembrado = finca.poligonoSembrado ? finca.poligonoSembrado.map(p => [...p]) : [];
        this._updatePolySummary();
    },

    _updatePolySummary() {
        const at = Helpers.polygonAreaHa(this._formPolyTotal);
        const as = Helpers.polygonAreaHa(this._formPolySembrado);
        const elT = document.getElementById('sumAreaTotal');
        const elS = document.getElementById('sumAreaSembrada');
        const ptT = document.getElementById('sumPtsTotal');
        const ptS = document.getElementById('sumPtsSembrada');
        if (elT) elT.textContent = (at > 0 ? at.toFixed(2) : '—') + ' ha';
        if (elS) elS.textContent = (as > 0 ? as.toFixed(2) : '—') + ' ha';
        if (ptT) ptT.textContent = `${this._formPolyTotal.length} puntos`;
        if (ptS) ptS.textContent = `${this._formPolySembrado.length} puntos`;
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

    // ============== EDITOR DE POLÍGONOS ==============
    _poly: { mode: 'total', map: null, layerTotal: null, layerSembrado: null, markers: [] },

    openPolygonEditor() {
        const form = document.getElementById('fincaForm');
        if (!form) return;

        // Snapshot completo del estado del form para restaurar al volver
        const snap = {};
        form.querySelectorAll('input, select, textarea').forEach(el => {
            if (el.name) snap[el.name] = el.type === 'checkbox' ? el.checked : el.value;
        });
        this._savedFormState = snap;

        const lat = parseFloat(snap.lat) || 7.0292;
        const lng = parseFloat(snap.lng) || -71.4475;
        const nombre = snap.nombre || 'Finca';

        this._poly._draftTotal = this._formPolyTotal.map(p => [...p]);
        this._poly._draftSembrado = this._formPolySembrado.map(p => [...p]);
        this._poly.mode = 'total';
        this._poly.centerLat = lat;
        this._poly.centerLng = lng;

        // Cerramos modal de finca y abrimos el de polígonos (mantenemos estado en memoria)
        UI.openModal({
            title: `Polígonos del terreno · ${Helpers.escapeHtml(nombre)}`,
            size: 'lg',
            body: `
                <div class="poly-editor">
                    <div class="poly-toolbar">
                        <div class="poly-mode-tabs">
                            <button type="button" class="poly-mode-btn active" data-mode="total" onclick="FincasModule._polySetMode('total')">
                                <span class="poly-dot" style="background:#f59e0b;"></span> Área TOTAL de la finca
                            </button>
                            <button type="button" class="poly-mode-btn" data-mode="sembrado" onclick="FincasModule._polySetMode('sembrado')">
                                <span class="poly-dot" style="background:#3b7a48;"></span> Área SEMBRADA en cacao
                            </button>
                        </div>
                        <div class="poly-tools">
                            <button type="button" class="btn btn-sm btn-outline" onclick="FincasModule._polyUndo()" title="Deshacer último punto"><i class="fa-solid fa-rotate-left"></i> Deshacer</button>
                            <button type="button" class="btn btn-sm btn-outline" onclick="FincasModule._polyClear()" title="Vaciar polígono actual"><i class="fa-solid fa-eraser"></i> Vaciar</button>
                            <button type="button" class="btn btn-sm btn-outline" onclick="FincasModule._polyCenterMap()" title="Centrar mapa en finca"><i class="fa-solid fa-crosshairs"></i> Centrar</button>
                        </div>
                    </div>

                    <div class="alert alert-info" style="margin:10px 0;">
                        <i class="fa-solid fa-circle-info"></i>
                        <div>
                            <strong>Modo dibujo:</strong> haz click sobre el mapa para añadir puntos al polígono activo. También puedes pegar coordenadas abajo en formato <code>lat, lng</code> (una por línea).
                        </div>
                    </div>

                    <div class="poly-grid">
                        <div id="polyEditMap" class="map-container" style="height:420px;"></div>
                        <div class="poly-side">
                            <div class="poly-stats">
                                <div class="poly-stat">
                                    <span class="poly-stat-label">Área total</span>
                                    <span class="poly-stat-value" id="polyAreaTotal">— ha</span>
                                </div>
                                <div class="poly-stat">
                                    <span class="poly-stat-label">Área sembrada</span>
                                    <span class="poly-stat-value" id="polyAreaSembrada">— ha</span>
                                </div>
                                <div class="poly-stat">
                                    <span class="poly-stat-label">% de uso</span>
                                    <span class="poly-stat-value" id="polyAreaPct">— %</span>
                                </div>
                            </div>
                            <label style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-top:8px; display:block;">
                                Coordenadas del polígono <span id="polyModeLabel">(área TOTAL)</span>
                            </label>
                            <textarea id="polyCoords" rows="9" style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; font-family:monospace; font-size:11px;" placeholder="7.0421, -71.4321&#10;7.0425, -71.4310&#10;7.0410, -71.4308"></textarea>
                            <div class="flex-row" style="margin-top:6px;">
                                <button type="button" class="btn btn-sm btn-outline" onclick="FincasModule._polyParseCoords()"><i class="fa-solid fa-cloud-arrow-up"></i> Cargar coordenadas</button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="FincasModule._polyCancel()">Cancelar</button>
                <button class="btn btn-primary" onclick="FincasModule._polyApply()"><i class="fa-solid fa-check"></i> Aplicar polígonos</button>
            `
        });

        setTimeout(() => this._polyInitMap(), 80);
    },

    _polyInitMap() {
        if (this._poly.map) { try { this._poly.map.remove(); } catch (e) {} this._poly.map = null; }
        const map = L.map('polyEditMap').setView([this._poly.centerLat, this._poly.centerLng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM', maxZoom: 20 }).addTo(map);
        // Capa satelital opcional
        const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Imagery © Esri', maxZoom: 19 });
        L.control.layers({ 'Calles': map.eachLayer(l => l), 'Satélite': sat }, null, { position: 'topright' }).addTo(map);

        // Marcador del centro de finca
        L.circleMarker([this._poly.centerLat, this._poly.centerLng], {
            radius: 7, color: '#dc2626', fillColor: '#fff', fillOpacity: 1, weight: 3
        }).addTo(map).bindTooltip('Centro de la finca', { permanent: false });

        map.on('click', (e) => {
            this._polyAddPoint(e.latlng.lat, e.latlng.lng);
        });

        this._poly.map = map;
        this._polyRedraw();
        this._polyUpdateTextarea();
    },

    _polySetMode(mode) {
        this._poly.mode = mode;
        document.querySelectorAll('.poly-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
        document.getElementById('polyModeLabel').textContent = mode === 'total' ? '(área TOTAL)' : '(área SEMBRADA)';
        this._polyRedraw();
        this._polyUpdateTextarea();
    },

    _polyAddPoint(lat, lng) {
        const arr = this._poly.mode === 'total' ? this._poly._draftTotal : this._poly._draftSembrado;
        arr.push([+lat.toFixed(6), +lng.toFixed(6)]);
        this._polyRedraw();
        this._polyUpdateTextarea();
    },

    _polyUndo() {
        const arr = this._poly.mode === 'total' ? this._poly._draftTotal : this._poly._draftSembrado;
        arr.pop();
        this._polyRedraw();
        this._polyUpdateTextarea();
    },

    _polyClear() {
        if (this._poly.mode === 'total') this._poly._draftTotal = [];
        else this._poly._draftSembrado = [];
        this._polyRedraw();
        this._polyUpdateTextarea();
    },

    _polyCenterMap() {
        if (!this._poly.map) return;
        const arr = this._poly.mode === 'total' ? this._poly._draftTotal : this._poly._draftSembrado;
        if (arr.length >= 2) {
            this._poly.map.fitBounds(arr, { padding: [40, 40] });
        } else {
            this._poly.map.setView([this._poly.centerLat, this._poly.centerLng], 16);
        }
    },

    _polyParseCoords() {
        const ta = document.getElementById('polyCoords');
        const lines = ta.value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const points = [];
        for (const line of lines) {
            const m = line.match(/(-?\d+(?:\.\d+)?)[\s,;]+(-?\d+(?:\.\d+)?)/);
            if (m) {
                const lat = parseFloat(m[1]);
                const lng = parseFloat(m[2]);
                if (!isNaN(lat) && !isNaN(lng)) points.push([lat, lng]);
            }
        }
        if (!points.length) { UI.toast('No se reconocieron coordenadas válidas', 'warning'); return; }
        if (this._poly.mode === 'total') this._poly._draftTotal = points;
        else this._poly._draftSembrado = points;
        this._polyRedraw();
        UI.toast(`${points.length} coordenadas cargadas`, 'success');
    },

    _polyRedraw() {
        const map = this._poly.map;
        if (!map) return;
        // Limpiar capas previas
        if (this._poly.layerTotal) { map.removeLayer(this._poly.layerTotal); this._poly.layerTotal = null; }
        if (this._poly.layerSembrado) { map.removeLayer(this._poly.layerSembrado); this._poly.layerSembrado = null; }
        this._poly.markers.forEach(m => map.removeLayer(m));
        this._poly.markers = [];

        // Polígono total (amarillo discontinuo)
        if (this._poly._draftTotal.length >= 2) {
            this._poly.layerTotal = L.polygon(this._poly._draftTotal, {
                color: '#f59e0b', weight: 3, dashArray: '8,6', fillColor: '#fbbf24', fillOpacity: 0.10
            }).addTo(map);
        }
        // Polígono sembrado (verde sólido)
        if (this._poly._draftSembrado.length >= 2) {
            this._poly.layerSembrado = L.polygon(this._poly._draftSembrado, {
                color: '#3b7a48', weight: 3, fillColor: '#6bb377', fillOpacity: 0.35
            }).addTo(map);
        }

        // Marcadores de puntos del modo activo
        const arr = this._poly.mode === 'total' ? this._poly._draftTotal : this._poly._draftSembrado;
        const col = this._poly.mode === 'total' ? '#f59e0b' : '#3b7a48';
        arr.forEach((p, i) => {
            const mk = L.circleMarker(p, { radius: 6, color: col, fillColor: 'white', fillOpacity: 1, weight: 2 })
                .addTo(map).bindTooltip(`${i + 1}`, { permanent: true, direction: 'top', offset: [0, -6], className: 'poly-tip' });
            this._poly.markers.push(mk);
        });

        // Actualizar stats
        const at = Helpers.polygonAreaHa(this._poly._draftTotal);
        const as = Helpers.polygonAreaHa(this._poly._draftSembrado);
        const pct = at > 0 ? (as / at) * 100 : 0;
        document.getElementById('polyAreaTotal').textContent = (at > 0 ? at.toFixed(2) : '—') + ' ha';
        document.getElementById('polyAreaSembrada').textContent = (as > 0 ? as.toFixed(2) : '—') + ' ha';
        document.getElementById('polyAreaPct').textContent = (pct > 0 ? pct.toFixed(1) : '—') + ' %';
    },

    _polyUpdateTextarea() {
        const ta = document.getElementById('polyCoords');
        if (!ta) return;
        const arr = this._poly.mode === 'total' ? this._poly._draftTotal : this._poly._draftSembrado;
        ta.value = arr.map(p => p[0].toFixed(6) + ', ' + p[1].toFixed(6)).join('\n');
    },

    _polyApply() {
        // Validación: polígono debe tener al menos 3 puntos o estar vacío
        if (this._poly._draftTotal.length > 0 && this._poly._draftTotal.length < 3) {
            UI.toast('El área total debe tener al menos 3 puntos o estar vacía', 'warning');
            return;
        }
        if (this._poly._draftSembrado.length > 0 && this._poly._draftSembrado.length < 3) {
            UI.toast('El área sembrada debe tener al menos 3 puntos o estar vacía', 'warning');
            return;
        }
        this._formPolyTotal = this._poly._draftTotal.map(p => [...p]);
        this._formPolySembrado = this._poly._draftSembrado.map(p => [...p]);
        if (this._poly.map) { try { this._poly.map.remove(); } catch (e) {} this._poly.map = null; }
        UI.closeModal();
        // Reabrir el form de finca con los polígonos actualizados
        setTimeout(() => this._reopenFincaForm(), 50);
    },

    _polyCancel() {
        if (this._poly.map) { try { this._poly.map.remove(); } catch (e) {} this._poly.map = null; }
        UI.closeModal();
        setTimeout(() => this._reopenFincaForm(), 50);
    },

    _reopenFincaForm() {
        const formState = this._savedFormState || {};
        const chips = [...this._formChips];
        const polyTotal = this._formPolyTotal.map(p => [...p]);
        const polySembrado = this._formPolySembrado.map(p => [...p]);

        this.openForm(formState.id || null);
        // openForm restablece polígonos/chips desde storage; sobreescribimos con los valores del editor
        this._formChips = chips.length ? chips : this._formChips;
        this._formPolyTotal = polyTotal;
        this._formPolySembrado = polySembrado;

        setTimeout(() => {
            Object.entries(formState).forEach(([k, v]) => {
                const el = document.querySelector(`#fincaForm [name="${k}"]`);
                if (el && v !== undefined && v !== null && el.type !== 'hidden') el.value = v;
            });
            this._renderChips();
            this._updatePolySummary();
        }, 80);
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
            clones: [...this._formChips],
            poligonoTotal: (this._formPolyTotal || []).map(p => [...p]),
            poligonoSembrado: (this._formPolySembrado || []).map(p => [...p])
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
                        ${(f.poligonoTotal?.length || f.poligonoSembrado?.length) ? `
                            <h4 style="margin-top:16px; margin-bottom:8px; color:var(--cacao-700);"><i class="fa-solid fa-draw-polygon"></i> Polígonos del terreno</h4>
                            <p>
                                <span class="status-dot yellow"></span> Área total: <strong>${f.poligonoTotal?.length >= 3 ? Helpers.polygonAreaHa(f.poligonoTotal).toFixed(2) + ' ha' : '—'}</strong><br>
                                <span class="status-dot green"></span> Área sembrada: <strong>${f.poligonoSembrado?.length >= 3 ? Helpers.polygonAreaHa(f.poligonoSembrado).toFixed(2) + ' ha' : '—'}</strong>
                            </p>
                        ` : ''}

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
            const map = L.map('fincaDetailMap').setView([f.lat, f.lng], 15);
            const calles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
            const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Imagery © Esri', maxZoom: 19 });
            L.control.layers({ 'Calles': calles, 'Satélite': sat }).addTo(map);

            let allBounds = [[f.lat, f.lng]];
            if (f.poligonoTotal && f.poligonoTotal.length >= 3) {
                const poly = L.polygon(f.poligonoTotal, { color: '#f59e0b', weight: 3, dashArray: '8,6', fillColor: '#fbbf24', fillOpacity: 0.10 }).addTo(map);
                poly.bindTooltip(`Área total: ${Helpers.polygonAreaHa(f.poligonoTotal).toFixed(2)} ha`);
                allBounds = allBounds.concat(f.poligonoTotal);
            }
            if (f.poligonoSembrado && f.poligonoSembrado.length >= 3) {
                const poly = L.polygon(f.poligonoSembrado, { color: '#3b7a48', weight: 3, fillColor: '#6bb377', fillOpacity: 0.35 }).addTo(map);
                poly.bindTooltip(`Área sembrada: ${Helpers.polygonAreaHa(f.poligonoSembrado).toFixed(2)} ha`);
                allBounds = allBounds.concat(f.poligonoSembrado);
            }
            L.marker([f.lat, f.lng]).addTo(map).bindPopup(f.nombre).openPopup();
            if (allBounds.length > 1) map.fitBounds(allBounds, { padding: [20, 20] });
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
        XLSX.writeFile(wb, 'Fincas_SmartCacao.xlsx');
        UI.toast('Excel descargado', 'success');
    }
};
