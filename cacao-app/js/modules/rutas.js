/* ================================================================
   modules/rutas.js — Planificador automático de rutas
================================================================ */

const RutasModule = {

    state: { fecha: null, vehiculoId: '', currentRoute: null, view: 'planner', map: null },

    VELOCIDAD_PROM_KMH: 35,
    TIEMPO_DESCARGA_MIN: 12,
    HORA_INICIO: 6, // 6:00 AM

    nextRouteNumero() {
        const list = Storage.list(Storage.KEYS.rutas);
        const year = new Date().getFullYear();
        const max = list.map(r => parseInt((r.numero || '').split('-').pop()) || 0).reduce((a, b) => Math.max(a, b), 0);
        return `RT-${year}-${String(max + 1).padStart(3, '0')}`;
    },

    render() {
        this.state.fecha = this.state.fecha || Helpers.today();
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Planificador de Rutas', 'Cálculo automático de rutas óptimas de recolección', `
                <button class="btn btn-outline" onclick="RutasModule.switchView('historial')"><i class="fa-solid fa-clock-rotate-left"></i> Historial</button>
                <button class="btn btn-outline" onclick="RutasModule.switchView('calendario')"><i class="fa-regular fa-calendar"></i> Calendario</button>
                <button class="btn btn-outline" onclick="RutasModule.switchView('tablero')"><i class="fa-solid fa-table-columns"></i> Tablero</button>
                <button class="btn btn-primary ${this.state.view === 'planner' ? 'active' : ''}" onclick="RutasModule.switchView('planner')"><i class="fa-solid fa-route"></i> Planificador</button>
            `)}
            <div id="rutasView"></div>
        `;
        this.renderView();
    },

    switchView(v) { this.state.view = v; this.render(); },

    renderView() {
        const t = document.getElementById('rutasView');
        if (this.state.view === 'planner') t.innerHTML = this.renderPlanner();
        if (this.state.view === 'historial') t.innerHTML = this.renderHistorial();
        if (this.state.view === 'calendario') t.innerHTML = this.renderCalendario();
        if (this.state.view === 'tablero') t.innerHTML = this.renderTablero();
        if (this.state.view === 'planner') this._tryAutoComputeRoute();
    },

    renderPlanner() {
        const vehiculos = Storage.list(Storage.KEYS.vehiculos);
        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="flex-row" style="align-items:flex-end;">
                        <div class="form-group" style="flex:1; min-width:180px;">
                            <label>Fecha de planificación</label>
                            <input type="date" id="planDate" value="${this.state.fecha}" onchange="RutasModule.state.fecha=this.value; RutasModule.state.currentRoute=null; RutasModule.renderView();">
                        </div>
                        <div class="form-group" style="flex:1; min-width:200px;">
                            <label>Vehículo asignado</label>
                            <select id="planVeh" onchange="RutasModule.state.vehiculoId=this.value; RutasModule._refreshRouteCapacity();">
                                <option value="">— Selecciona vehículo —</option>
                                ${vehiculos.map(v => `<option value="${v.id}" ${this.state.vehiculoId === v.id ? 'selected' : ''}>${Helpers.escapeHtml(v.placa)} · ${Helpers.escapeHtml(v.marca)} (${Helpers.formatKg(v.capacidad)})</option>`).join('')}
                            </select>
                        </div>
                        <button class="btn btn-primary" onclick="RutasModule.computeRoute()"><i class="fa-solid fa-wand-magic-sparkles"></i> Calcular ruta</button>
                        <button class="btn btn-secondary" onclick="RutasModule.saveRoute()" ${this.state.currentRoute ? '' : 'disabled'}><i class="fa-solid fa-floppy-disk"></i> Guardar ruta</button>
                    </div>
                </div>
            </div>
            <div id="routeResult"></div>
        `;
    },

    _tryAutoComputeRoute() {
        // Si hay órdenes para la fecha, computar automáticamente
        const ords = this._ordenesDelDia();
        if (ords.length && !this.state.currentRoute) {
            this.computeRoute();
        } else if (this.state.currentRoute) {
            this._paintRoute();
        } else {
            const el = document.getElementById('routeResult');
            if (el) el.innerHTML = UI.emptyState('route', 'Sin órdenes', 'No hay órdenes para esta fecha. Programa órdenes en el módulo "Órdenes de servicio".');
        }
    },

    _ordenesDelDia() {
        return Storage.list(Storage.KEYS.ordenes)
            .filter(o => o.fecha === this.state.fecha)
            .filter(o => ['Pendiente', 'Confirmada', 'En ruta'].includes(o.estado));
    },

    computeRoute() {
        const ordenes = this._ordenesDelDia();
        if (!ordenes.length) {
            UI.toast('No hay órdenes para esta fecha', 'warning');
            this.state.currentRoute = null;
            this._paintRoute();
            return;
        }
        const fincas = Storage.list(Storage.KEYS.fincas);
        const fincaMap = Object.fromEntries(fincas.map(f => [f.id, f]));
        const config = Storage.get(Storage.KEYS.config);
        const start = config.puntoSalida;

        const points = ordenes.map(o => {
            const f = fincaMap[o.fincaId];
            return {
                ordenId: o.id, numero: o.numero,
                fincaId: o.fincaId, fincaNombre: f?.nombre || '?',
                propietario: f?.propietario || '?', vereda: f?.vereda || '?',
                lat: f?.lat, lng: f?.lng,
                cantidad: o.cantidad, tipoCacao: o.tipoCacao,
                calidad: o.calidad, clones: o.clones
            };
        }).filter(p => p.lat && p.lng);

        const result = Helpers.optimizeRoute(start, points);

        // Calcular horas estimadas
        let accumTime = 0;
        const speedKmMin = this.VELOCIDAD_PROM_KMH / 60;
        const stops = result.stops.map((s, i) => {
            accumTime += s.distance / speedKmMin;
            const hora = new Date();
            hora.setHours(this.HORA_INICIO, 0, 0, 0);
            hora.setMinutes(hora.getMinutes() + Math.round(accumTime));
            const horaStr = hora.toTimeString().slice(0, 5);
            accumTime += this.TIEMPO_DESCARGA_MIN;
            return { ...s, horaEstimada: horaStr };
        });

        const totalKg = stops.reduce((a, b) => a + b.cantidad, 0);
        const totalKm = result.totalKm;
        const tiempoMin = Math.round(totalKm / speedKmMin + stops.length * this.TIEMPO_DESCARGA_MIN);

        this.state.currentRoute = {
            id: null,
            numero: this.nextRouteNumero(),
            fecha: this.state.fecha,
            vehiculoId: this.state.vehiculoId,
            stops,
            totalKm,
            totalKg,
            tiempoEstimadoMin: tiempoMin,
            puntoSalida: { ...start },
            createdAt: Helpers.now()
        };
        this._paintRoute();
        UI.toast('Ruta calculada con éxito', 'success');
    },

    _refreshRouteCapacity() {
        if (this.state.currentRoute) {
            this.state.currentRoute.vehiculoId = this.state.vehiculoId;
            this._paintRoute();
        }
    },

    _paintRoute() {
        const r = this.state.currentRoute;
        const el = document.getElementById('routeResult');
        if (!el) return;
        if (!r) { el.innerHTML = ''; return; }

        const vehiculo = Storage.findById(Storage.KEYS.vehiculos, r.vehiculoId);
        const capacidad = vehiculo?.capacidad || 0;
        const uso = capacidad ? (r.totalKg / capacidad) * 100 : 0;
        let alert = '';
        let capacityClass = 'capacity-fill';
        if (capacidad && r.totalKg > capacidad) {
            const exceso = r.totalKg - capacidad;
            alert = `
                <div class="alert alert-danger">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <div>
                        <strong>EL VEHÍCULO NO CUMPLE CON LA CAPACIDAD REQUERIDA</strong><br>
                        <small>Capacidad del vehículo: ${Helpers.formatKg(capacidad)} · Total ruta: ${Helpers.formatKg(r.totalKg)} · Exceso: ${Helpers.formatKg(exceso)} (faltan ${Helpers.formatKg(exceso)})</small>
                    </div>
                </div>
            `;
            capacityClass = 'capacity-fill over';
        } else if (capacidad && uso > 85) {
            capacityClass = 'capacity-fill warn';
            alert = `
                <div class="alert alert-warning">
                    <i class="fa-solid fa-circle-info"></i>
                    <div><strong>Capacidad próxima al límite</strong><br><small>Uso: ${uso.toFixed(1)}% de la capacidad del vehículo</small></div>
                </div>
            `;
        }

        el.innerHTML = `
            ${alert}
            <div class="kpi-grid">
                <div class="kpi-card kpi-cacao"><div class="kpi-header"><span class="kpi-label">Total Fincas</span><div class="kpi-icon"><i class="fa-solid fa-tree"></i></div></div><div class="kpi-value">${r.stops.length}</div></div>
                <div class="kpi-card"><div class="kpi-header"><span class="kpi-label">Cacao a recolectar</span><div class="kpi-icon"><i class="fa-solid fa-weight-hanging"></i></div></div><div class="kpi-value">${Helpers.formatNumber(r.totalKg)}<span class="kpi-unit">kg</span></div></div>
                <div class="kpi-card kpi-info"><div class="kpi-header"><span class="kpi-label">Distancia total</span><div class="kpi-icon"><i class="fa-solid fa-route"></i></div></div><div class="kpi-value">${r.totalKm.toFixed(1)}<span class="kpi-unit">km</span></div></div>
                <div class="kpi-card kpi-warning"><div class="kpi-header"><span class="kpi-label">Tiempo estimado</span><div class="kpi-icon"><i class="fa-regular fa-clock"></i></div></div><div class="kpi-value">${Math.floor(r.tiempoEstimadoMin / 60)}h ${r.tiempoEstimadoMin % 60}m</div></div>
            </div>

            ${vehiculo ? `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="flex-between">
                            <div>
                                <strong>Vehículo asignado:</strong> ${Helpers.escapeHtml(vehiculo.placa)} · ${Helpers.escapeHtml(vehiculo.marca)} ${Helpers.escapeHtml(vehiculo.modelo)}<br>
                                <small class="text-muted">Capacidad: ${Helpers.formatKg(vehiculo.capacidad)} · Uso: ${uso.toFixed(1)}%</small>
                            </div>
                            <div style="font-weight:700; font-size:18px; color:${r.totalKg > capacidad ? 'var(--danger)' : 'var(--success)'};">
                                ${Helpers.formatKg(r.totalKg)} / ${Helpers.formatKg(capacidad)}
                            </div>
                        </div>
                        <div class="capacity-bar"><div class="${capacityClass}" style="width:${Math.min(100, uso)}%;"></div></div>
                    </div>
                </div>
            ` : ''}

            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">Recorrido secuencial</div>
                            <div class="card-subtitle">Optimización por vecino más cercano</div>
                        </div>
                        <button class="btn btn-sm btn-outline" onclick="PDFGen.cronogramaRuta(RutasModule.state.currentRoute)"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                    </div>
                    <div class="card-body">
                        <div class="route-stop" style="border:2px dashed var(--cacao-300); background:var(--beige-200);">
                            <div class="route-stop-num" style="background:linear-gradient(135deg, var(--cacao-700), var(--cacao-900));"><i class="fa-solid fa-warehouse"></i></div>
                            <div class="route-stop-info">
                                <strong>SALIDA — ${Helpers.escapeHtml(r.puntoSalida.nombre)}</strong>
                                <span>Lat: ${r.puntoSalida.lat}, Lng: ${r.puntoSalida.lng}</span>
                            </div>
                            <div class="route-meta">
                                <strong>0 km</strong>
                                <div>${('0' + this.HORA_INICIO).slice(-2)}:00</div>
                            </div>
                        </div>
                        ${r.stops.map((s, i) => `
                            <div class="route-stop">
                                <div class="route-stop-num">${i + 1}</div>
                                <div class="route-stop-info">
                                    <strong>${Helpers.escapeHtml(s.fincaNombre)}</strong>
                                    <span>${Helpers.escapeHtml(s.propietario)} · ${Helpers.escapeHtml(s.vereda)}</span>
                                </div>
                                <div class="route-meta">
                                    <strong>${Helpers.formatKg(s.cantidad)}</strong>
                                    <div>${s.horaEstimada} · ${s.distance.toFixed(1)} km</div>
                                </div>
                            </div>
                        `).join('')}
                        <div class="route-stop" style="border:2px dashed var(--green-700); background:var(--green-100);">
                            <div class="route-stop-num" style="background:linear-gradient(135deg, var(--green-700), var(--green-900));"><i class="fa-solid fa-flag-checkered"></i></div>
                            <div class="route-stop-info">
                                <strong>REGRESO — Centro de acopio</strong>
                                <span>Retorno final</span>
                            </div>
                            <div class="route-meta">
                                <strong>Total: ${r.totalKm.toFixed(1)} km</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Mapa de ruta</div>
                    </div>
                    <div class="card-body" style="padding:0;">
                        <div id="rutaMap" class="map-container"></div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this._paintMap(), 80);
    },

    _paintMap() {
        const r = this.state.currentRoute;
        if (!r) return;
        if (this.state.map) { this.state.map.remove(); this.state.map = null; }
        const map = L.map('rutaMap').setView([r.puntoSalida.lat, r.puntoSalida.lng], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);

        const homeIcon = L.divIcon({ html: '<div style="background:#7a4f2a; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,.3); font-weight:bold;"><i class="fa-solid fa-warehouse"></i></div>', iconSize: [34, 34], iconAnchor: [17, 17] });
        L.marker([r.puntoSalida.lat, r.puntoSalida.lng], { icon: homeIcon }).addTo(map).bindPopup('Centro de acopio');

        const coords = [[r.puntoSalida.lat, r.puntoSalida.lng]];
        r.stops.forEach((s, i) => {
            coords.push([s.lat, s.lng]);
            const icon = L.divIcon({ html: `<div style="background:#3b7a48; color:white; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,.3); font-weight:bold;">${i + 1}</div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
            L.marker([s.lat, s.lng], { icon }).addTo(map).bindPopup(`<strong>${i + 1}. ${s.fincaNombre}</strong><br>${s.propietario}<br><small>${Helpers.formatKg(s.cantidad)} · ${s.horaEstimada}</small>`);
        });
        coords.push([r.puntoSalida.lat, r.puntoSalida.lng]);
        L.polyline(coords, { color: '#3b7a48', weight: 4, opacity: 0.7, dashArray: '8,8' }).addTo(map);
        map.fitBounds(coords);
        this.state.map = map;
    },

    saveRoute() {
        const r = this.state.currentRoute;
        if (!r) { UI.toast('No hay ruta para guardar', 'warning'); return; }
        if (!r.vehiculoId) { UI.toast('Asigna un vehículo primero', 'warning'); return; }

        const v = Storage.findById(Storage.KEYS.vehiculos, r.vehiculoId);
        if (v && r.totalKg > v.capacidad) {
            UI.confirm({
                title: '¿Guardar ruta con sobrecapacidad?',
                message: `El vehículo ${v.placa} no cumple la capacidad. Faltan ${Helpers.formatKg(r.totalKg - v.capacidad)}.`,
                danger: true, okText: 'Guardar de todos modos'
            }).then(ok => { if (ok) this._persistRoute(); });
            return;
        }
        this._persistRoute();
    },

    _persistRoute() {
        const r = this.state.currentRoute;
        const saved = Storage.add(Storage.KEYS.rutas, r);
        // Actualizar estado de órdenes a "En ruta"
        r.stops.forEach(s => {
            const o = Storage.findById(Storage.KEYS.ordenes, s.ordenId);
            if (o && o.estado !== 'Recolectada' && o.estado !== 'Finalizada') {
                Storage.update(Storage.KEYS.ordenes, s.ordenId, { estado: 'En ruta', rutaId: saved.id });
            }
        });
        UI.toast(`Ruta ${saved.numero} guardada`, 'success');
        this.state.currentRoute = saved;
        this._paintRoute();
    },

    // ===== HISTORIAL =====
    renderHistorial() {
        const list = Helpers.sortBy(Storage.list(Storage.KEYS.rutas), 'fecha', false);
        if (!list.length) return UI.emptyState('route', 'Sin rutas guardadas', 'Aún no hay rutas guardadas en el historial.');
        const vehs = Object.fromEntries(Storage.list(Storage.KEYS.vehiculos).map(v => [v.id, v]));
        const rows = list.map(r => {
            const v = vehs[r.vehiculoId];
            return `
                <tr>
                    <td><strong>${r.numero}</strong></td>
                    <td>${Helpers.formatDate(r.fecha)}</td>
                    <td>${v ? `${v.placa} · ${v.marca}` : '-'}</td>
                    <td>${r.stops.length} fincas</td>
                    <td>${Helpers.formatKg(r.totalKg)}</td>
                    <td>${r.totalKm.toFixed(1)} km</td>
                    <td>${Math.floor(r.tiempoEstimadoMin / 60)}h ${r.tiempoEstimadoMin % 60}m</td>
                    <td>
                        <div class="row-actions">
                            <button onclick="RutasModule.loadRoute('${r.id}')" title="Cargar"><i class="fa-solid fa-folder-open"></i></button>
                            <button onclick="PDFGen.cronogramaRuta(Storage.findById(Storage.KEYS.rutas, '${r.id}'))" title="PDF"><i class="fa-solid fa-file-pdf"></i></button>
                            <button class="danger" onclick="RutasModule.deleteRoute('${r.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        return `
            <div class="table-wrap">
                <div class="table-toolbar"><strong>Historial de rutas</strong><span class="text-muted" style="margin-left:auto;">${list.length} rutas</span></div>
                <table class="data-table">
                    <thead><tr><th>Número</th><th>Fecha</th><th>Vehículo</th><th>Fincas</th><th>Cacao</th><th>Distancia</th><th>Tiempo</th><th style="width:120px;">Acciones</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    loadRoute(id) {
        const r = Storage.findById(Storage.KEYS.rutas, id);
        this.state.currentRoute = { ...r };
        this.state.fecha = r.fecha;
        this.state.vehiculoId = r.vehiculoId;
        this.state.view = 'planner';
        this.render();
    },

    async deleteRoute(id) {
        const ok = await UI.confirm({ title: '¿Eliminar ruta?', message: 'Las órdenes asociadas no se modificarán.' });
        if (!ok) return;
        Storage.remove_item(Storage.KEYS.rutas, id);
        UI.toast('Ruta eliminada', 'success');
        this.renderView();
    },

    renderCalendario() {
        const rutas = Storage.list(Storage.KEYS.rutas);
        const byDate = {};
        rutas.forEach(r => { (byDate[r.fecha] = byDate[r.fecha] || []).push(r); });

        const refDate = new Date();
        const year = refDate.getFullYear();
        const month = refDate.getMonth();
        const first = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = (first.getDay() + 6) % 7;

        const headers = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(h => `<div>${h}</div>`).join('');
        let cells = '';
        for (let i = 0; i < startDay; i++) cells += `<div class="calendar-day empty"></div>`;
        const today = Helpers.today();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const rs = byDate[dateStr] || [];
            const kg = rs.reduce((a, b) => a + b.totalKg, 0);
            cells += `
                <div class="calendar-day ${dateStr === today ? 'today' : ''}">
                    <div class="day-num">${d}</div>
                    ${rs.length > 0 ? `<div class="day-count">${rs.length} ruta${rs.length > 1 ? 's' : ''}</div><div style="font-size:10px; color:var(--text-muted); margin-top:4px;">${Helpers.formatKg(kg)}</div>` : ''}
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <div class="card-title" style="text-transform:capitalize;">${first.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</div>
                </div>
                <div class="card-body">
                    <div class="calendar-day-headers">${headers}</div>
                    <div class="calendar">${cells}</div>
                </div>
            </div>
        `;
    },

    renderTablero() {
        const today = Helpers.today();
        const rutas = Storage.list(Storage.KEYS.rutas);
        const proximas = Helpers.sortBy(rutas.filter(r => r.fecha >= today), 'fecha', true);
        const vehs = Object.fromEntries(Storage.list(Storage.KEYS.vehiculos).map(v => [v.id, v]));

        if (!proximas.length) return UI.emptyState('table-columns', 'Tablero vacío', 'No hay rutas programadas próximamente.');

        return `
            <div class="grid-2">
                ${proximas.map(r => {
                    const v = vehs[r.vehiculoId];
                    const cap = v?.capacidad || 0;
                    const uso = cap ? Math.min(100, (r.totalKg / cap) * 100) : 0;
                    const cls = !cap ? 'capacity-fill' : (r.totalKg > cap ? 'capacity-fill over' : (uso > 85 ? 'capacity-fill warn' : 'capacity-fill'));
                    return `
                        <div class="card">
                            <div class="card-header" style="background:linear-gradient(90deg, var(--green-100), transparent);">
                                <div><div class="card-title">${r.numero}</div><div class="card-subtitle">${Helpers.formatDate(r.fecha, {weekday:'long', day:'numeric', month:'long'})}</div></div>
                                <span class="badge badge-cacao">${r.stops.length} fincas</span>
                            </div>
                            <div class="card-body">
                                <p><strong>Vehículo:</strong> ${v ? `${v.placa} (${Helpers.formatKg(v.capacidad)})` : '<span class="text-warning">Sin asignar</span>'}</p>
                                <p><strong>Cacao total:</strong> ${Helpers.formatKg(r.totalKg)}</p>
                                <p><strong>Distancia:</strong> ${r.totalKm.toFixed(1)} km · <strong>Tiempo:</strong> ${Math.floor(r.tiempoEstimadoMin/60)}h ${r.tiempoEstimadoMin%60}m</p>
                                ${cap ? `<div class="capacity-bar"><div class="${cls}" style="width:${uso}%"></div></div>` : ''}
                            </div>
                            <div class="card-footer" style="display:flex; gap:6px; justify-content:flex-end;">
                                <button class="btn btn-sm btn-outline" onclick="RutasModule.loadRoute('${r.id}')"><i class="fa-solid fa-folder-open"></i> Abrir</button>
                                <button class="btn btn-sm btn-outline" onclick="PDFGen.cronogramaRuta(Storage.findById(Storage.KEYS.rutas, '${r.id}'))"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
};
