/* ================================================================
   modules/config.js — Configuración del sistema
================================================================ */

const ConfigModule = {

    render() {
        const cfg = Storage.get(Storage.KEYS.config, {});
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Configuración', 'Datos de la empresa, precios y punto de salida', '')}

            <div class="grid-2">
                <div class="card">
                    <div class="card-header"><div class="card-title">Datos de la empresa</div></div>
                    <div class="card-body">
                        <form id="empresaForm">
                            <div class="form-grid">
                                <div class="form-group full"><label>Nombre</label><input type="text" name="nombre" value="${Helpers.escapeHtml(cfg.empresa?.nombre || '')}"></div>
                                <div class="form-group"><label>NIT</label><input type="text" name="nit" value="${Helpers.escapeHtml(cfg.empresa?.nit || '')}"></div>
                                <div class="form-group"><label>Teléfono</label><input type="text" name="telefono" value="${Helpers.escapeHtml(cfg.empresa?.telefono || '')}"></div>
                                <div class="form-group full"><label>Dirección</label><input type="text" name="direccion" value="${Helpers.escapeHtml(cfg.empresa?.direccion || '')}"></div>
                                <div class="form-group full"><label>Email</label><input type="email" name="email" value="${Helpers.escapeHtml(cfg.empresa?.email || '')}"></div>
                            </div>
                        </form>
                    </div>
                    <div class="card-footer" style="text-align:right;">
                        <button class="btn btn-primary" onclick="ConfigModule.saveEmpresa()"><i class="fa-solid fa-check"></i> Guardar</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header"><div class="card-title">Usuario activo / Equipo</div></div>
                    <div class="card-body">
                        <div class="form-group">
                            <label>Usuario actual (registrado en el log de auditoría)</label>
                            <select id="currentUserSel" onchange="ConfigModule.saveCurrentUser(this.value)">
                                ${(cfg.usuarios || ['Administrador']).map(u => `<option ${cfg.currentUser === u ? 'selected' : ''}>${Helpers.escapeHtml(u)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Equipo (un usuario por línea)</label>
                            <textarea id="usuariosText" rows="6" style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; font-family:inherit;">${(cfg.usuarios || []).join('\n')}</textarea>
                        </div>
                    </div>
                    <div class="card-footer" style="text-align:right;">
                        <button class="btn btn-primary" onclick="ConfigModule.saveUsuarios()"><i class="fa-solid fa-check"></i> Guardar equipo</button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header"><div class="card-title">Punto de salida</div></div>
                    <div class="card-body">
                        <form id="puntoForm">
                            <div class="form-grid">
                                <div class="form-group full"><label>Nombre</label><input type="text" name="nombre" value="${Helpers.escapeHtml(cfg.puntoSalida?.nombre || '')}"></div>
                                <div class="form-group"><label>Latitud</label><input type="number" step="0.0001" name="lat" value="${cfg.puntoSalida?.lat || ''}"></div>
                                <div class="form-group"><label>Longitud</label><input type="number" step="0.0001" name="lng" value="${cfg.puntoSalida?.lng || ''}"></div>
                            </div>
                        </form>
                    </div>
                    <div class="card-footer" style="text-align:right;">
                        <button class="btn btn-primary" onclick="ConfigModule.savePunto()"><i class="fa-solid fa-check"></i> Guardar</button>
                    </div>
                </div>

                <div class="card" style="grid-column: 1 / -1;">
                    <div class="card-header"><div class="card-title">Precios por kg (COP)</div></div>
                    <div class="card-body">
                        <form id="preciosForm">
                            <div class="form-grid">
                                <div class="form-group"><label>Seco - Estándar</label><input type="number" name="seco_estandar" value="${cfg.precios?.seco_estandar || 0}"></div>
                                <div class="form-group"><label>Seco - Premium</label><input type="number" name="seco_premium" value="${cfg.precios?.seco_premium || 0}"></div>
                                <div class="form-group"><label>Seco - Excelencia</label><input type="number" name="seco_excelencia" value="${cfg.precios?.seco_excelencia || 0}"></div>
                                <div class="form-group"><label>Baba - Estándar</label><input type="number" name="baba_estandar" value="${cfg.precios?.baba_estandar || 0}"></div>
                                <div class="form-group"><label>Baba - Premium</label><input type="number" name="baba_premium" value="${cfg.precios?.baba_premium || 0}"></div>
                                <div class="form-group"><label>Baba - Excelencia</label><input type="number" name="baba_excelencia" value="${cfg.precios?.baba_excelencia || 0}"></div>
                            </div>
                        </form>
                    </div>
                    <div class="card-footer" style="text-align:right;">
                        <button class="btn btn-primary" onclick="ConfigModule.savePrecios()"><i class="fa-solid fa-check"></i> Guardar precios</button>
                    </div>
                </div>

                <div class="card" style="grid-column: 1 / -1;">
                    <div class="card-header"><div class="card-title">Datos del sistema</div></div>
                    <div class="card-body">
                        <div class="alert alert-info">
                            <i class="fa-solid fa-circle-info"></i>
                            <div>
                                <strong>Persistencia local</strong><br>
                                Todos los datos se guardan en el navegador (LocalStorage). Para hacer respaldo descarga el JSON con el botón "Exportar datos".
                            </div>
                        </div>
                        <div class="flex-row">
                            <button class="btn btn-outline" onclick="ConfigModule.exportAll()"><i class="fa-solid fa-download"></i> Exportar datos</button>
                            <button class="btn btn-outline" onclick="document.getElementById('importFile').click()"><i class="fa-solid fa-upload"></i> Importar datos</button>
                            <input type="file" id="importFile" accept=".json" style="display:none;" onchange="ConfigModule.importAll(event)">
                            <button class="btn btn-warning" onclick="ConfigModule.resetSeed()"><i class="fa-solid fa-arrows-rotate"></i> Restaurar datos demo</button>
                            <button class="btn btn-danger" onclick="ConfigModule.clearAll()"><i class="fa-solid fa-trash"></i> Borrar todo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    saveEmpresa() {
        const data = UI.serializeForm(document.getElementById('empresaForm'));
        const cfg = Storage.get(Storage.KEYS.config, {});
        cfg.empresa = data;
        Storage.set(Storage.KEYS.config, cfg);
        UI.toast('Datos empresa guardados', 'success');
    },

    saveCurrentUser(name) {
        const cfg = Storage.get(Storage.KEYS.config, {});
        cfg.currentUser = name;
        Storage.set(Storage.KEYS.config, cfg);
        UI.toast(`Usuario activo: ${name}`, 'success');
        const lbl = document.getElementById('topbarUser');
        if (lbl) lbl.textContent = name;
    },

    saveUsuarios() {
        const text = document.getElementById('usuariosText').value;
        const usuarios = text.split('\n').map(s => s.trim()).filter(Boolean);
        const cfg = Storage.get(Storage.KEYS.config, {});
        cfg.usuarios = usuarios;
        if (usuarios.length && !usuarios.includes(cfg.currentUser)) cfg.currentUser = usuarios[0];
        Storage.set(Storage.KEYS.config, cfg);
        UI.toast(`${usuarios.length} usuario(s) guardados`, 'success');
        this.render();
    },

    savePunto() {
        const data = UI.serializeForm(document.getElementById('puntoForm'));
        const cfg = Storage.get(Storage.KEYS.config, {});
        cfg.puntoSalida = { nombre: data.nombre, lat: parseFloat(data.lat), lng: parseFloat(data.lng) };
        Storage.set(Storage.KEYS.config, cfg);
        UI.toast('Punto de salida actualizado', 'success');
    },

    savePrecios() {
        const data = UI.serializeForm(document.getElementById('preciosForm'));
        const cfg = Storage.get(Storage.KEYS.config, {});
        cfg.precios = {};
        Object.keys(data).forEach(k => cfg.precios[k] = parseFloat(data[k]) || 0);
        Storage.set(Storage.KEYS.config, cfg);
        UI.toast('Precios actualizados', 'success');
    },

    exportAll() {
        const data = Storage.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SmartCacao_Backup_${Helpers.today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        UI.toast('Backup descargado', 'success');
    },

    importAll(ev) {
        const file = ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const ok = await UI.confirm({ title: '¿Importar datos?', message: 'Se sobrescribirán los datos actuales.' });
                if (!ok) return;
                Storage.importAll(data);
                UI.toast('Datos importados', 'success');
                App.navigate('dashboard');
            } catch (err) {
                UI.toast('Archivo inválido', 'error');
            }
        };
        reader.readAsText(file);
    },

    async resetSeed() {
        const ok = await UI.confirm({ title: '¿Restaurar datos demo?', message: 'Se sobrescribirán todos los datos actuales con datos de ejemplo.' });
        if (!ok) return;
        Storage.clearAll();
        Storage.seedIfEmpty();
        UI.toast('Datos demo restaurados', 'success');
        App.navigate('dashboard');
    },

    async clearAll() {
        const ok = await UI.confirm({ title: '¿Borrar TODOS los datos?', message: 'Acción irreversible. Se perderá toda la información.' });
        if (!ok) return;
        Storage.clearAll();
        UI.toast('Datos eliminados', 'success');
        Storage.seedIfEmpty(); // re-sembrar para que la app siga funcionando
        App.navigate('dashboard');
    }
};
