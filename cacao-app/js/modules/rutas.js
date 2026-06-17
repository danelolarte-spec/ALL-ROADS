/* ================================================================
   modules/rutas.js — Planificador con soporte de MÚLTIPLES VIAJES
================================================================ */

const RutasModule = {

    state: {
        fecha: null,
        vehiculoId: '',
        currentRoute: null,
        view: 'planner',
        map: null,
        multiTrip: true   // Permitir múltiples viajes con mismo vehículo
    },

    VELOCIDAD_PROM_KMH: 35,
    TIEMPO_DESCARGA_MIN: 12,       // Tiempo de descarga en cada finca
    TIEMPO_DESCARGA_DEPOT_MIN: 25, // Tiempo de descarga en el centro de acopio entre viajes
    HORA_INICIO: 6,

    TRIP_COLORS: ['#3b7a48', '#7a4f2a', '#0ea5e9', '#dc2626', '#8b5cf6', '#f59e0b'],

    nextRouteNumero() {
        const list = Storage.list(Storage.KEYS.rutas);
        const year = new Date().getFullYear();
        const max = list.map(r => parseInt((r.numero || '').split('-').pop()) || 0).reduce((a, b) => Math.max(a, b), 0);
        return `RT-${year}-${String(max + 1).padStart(3, '0')}`;
    },

    // Convierte rutas legacy (con r.stops) al nuevo formato con r.trips
    _normalize(r) {
        if (!r) return r;
        if (r.trips && r.trips.length) return r;
        return {
            ...r,
            trips: [{
                num: 1,
                stops: r.stops || [],
                kg: r.totalKg || 0,
                km: r.totalKm || 0,
                timeMin: r.tiempoEstimadoMin || 0,
                horaInicio: ('0' + this.HORA_INICIO).slice(-2) + ':00',
                horaFin: ''
            }]
        };
    },

    render() {
        this.state.fecha = this.state.fecha || Helpers.today();
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Planificador de Rutas', 'Cálculo automático con soporte de múltiples viajes por vehículo', `
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
                            <select id="planVeh" onchange="RutasModule.state.vehiculoId=this.value; RutasModule.computeRoute();">
                                <option value="">— Selecciona vehículo —</option>
                                ${vehiculos.map(v => `<option value="${v.id}" ${this.state.vehiculoId === v.id ? 'selected' : ''}>${Helpers.escapeHtml(v.placa)} · ${Helpers.escapeHtml(v.marca)} (${Helpers.formatKg(v.capacidad)})</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="min-width:240px;">
                            <label class="checkbox-row" style="margin-top:18px;">
                                <input type="checkbox" id="multiTripChk" ${this.state.multiTrip ? 'checked' : ''}
                                    onchange="RutasModule.state.multiTrip=this.checked; RutasModule.computeRoute();">
                                Permitir múltiples viajes con mismo vehículo
                            </label>
                        </div>
                        <button class="btn btn-primary" onclick="RutasModule.computeRoute()"><i class="fa-solid fa-wand-magic-sparkles"></i> Recalcular</button>
                        <button class="btn btn-secondary" id="saveRouteBtn" onclick="RutasModule.saveRoute()" ${this.state.currentRoute ? '' : 'disabled'}><i class="fa-solid fa-floppy-disk"></i> Guardar ruta</button>
                    </div>
                </div>
            </div>
            <div id="routeResult"></div>
        `;
    },

    _tryAutoComputeRoute() {
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

    // =============== CÁLCULO PRINCIPAL ===============
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
        const vehiculo = Storage.findById(Storage.KEYS.vehiculos, this.state.vehiculoId);

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

        // Optimización global TSP
        const optimized = Helpers.optimizeRoute(start, points);
        const allStops = optimized.stops;

        // Decidir si dividir en múltiples viajes
        const totalKg = allStops.reduce((a, b) => a + b.cantidad, 0);
        const capacity = vehiculo?.capacidad || Infinity;
        const needsSplit = (this.state.multiTrip && vehiculo && totalKg > capacity);

        let tripGroups;
        if (needsSplit) {
            tripGroups = this._splitByCapacity(allStops, capacity);
        } else {
            tripGroups = [allStops];
        }

        // Construir cada viaje (re-optimizar y calcular tiempos secuencialmente)
        const speedKmMin = this.VELOCIDAD_PROM_KMH / 60;
        let cumulativeMin = 0;

        const trips = tripGroups.map((groupStops, idx) => {
            // Re-optimizar este grupo desde el centro de acopio
            const opt = Helpers.optimizeRoute(start, groupStops);
            const tripKg = groupStops.reduce((a, b) => a + b.cantidad, 0);

            // Calcular horas para cada parada
            let travelMin = 0;
            const stops = opt.stops.map((s, i) => {
                travelMin += s.distance / speedKmMin;
                const horaParada = this._minToHora(cumulativeMin + travelMin);
                travelMin += this.TIEMPO_DESCARGA_MIN;
                return { ...s, horaEstimada: horaParada };
            });

            const tripDurationMin = Math.round(
                opt.totalKm / speedKmMin + stops.length * this.TIEMPO_DESCARGA_MIN
            );

            const horaInicio = this._minToHora(cumulativeMin);
            cumulativeMin += tripDurationMin;
            const horaFin = this._minToHora(cumulativeMin);

            // Descarga en centro de acopio entre viajes
            if (idx < tripGroups.length - 1) cumulativeMin += this.TIEMPO_DESCARGA_DEPOT_MIN;

            return {
                num: idx + 1,
                stops,
                kg: tripKg,
                km: opt.totalKm,
                timeMin: tripDurationMin,
                horaInicio,
                horaFin
            };
        });

        const totalKm = trips.reduce((a, b) => a + b.km, 0);
        const totalTimeMin = Math.round(cumulativeMin);

        this.state.currentRoute = {
            id: this.state.currentRoute?.id || null,
            numero: this.state.currentRoute?.numero || this.nextRouteNumero(),
            fecha: this.state.fecha,
            vehiculoId: this.state.vehiculoId,
            trips,
            stops: trips.flatMap(t => t.stops), // legacy compat (PDFs, historial)
            totalKm, totalKg,
            tiempoEstimadoMin: totalTimeMin,
            puntoSalida: { ...start },
            createdAt: Helpers.now(),
            multiTrip: trips.length > 1
        };
        this._paintRoute();

        if (trips.length > 1) {
            UI.toast(`Ruta dividida en ${trips.length} viajes por capacidad insuficiente`, 'warning');
        } else {
            UI.toast('Ruta calculada con éxito', 'success');
        }
    },

    // Bin-packing greedy: respeta el orden ya optimizado
    _splitByCapacity(stops, capacity) {
        const groups = [];
        let cur = [];
        let curKg = 0;
        for (const s of stops) {
            // Si un solo stop excede la capacidad, va solo en su viaje (no se puede dividir un pedido)
            if (s.cantidad > capacity) {
                if (cur.length) { groups.push(cur); cur = []; curKg = 0; }
                groups.push([s]);
                continue;
            }
            if (cur.length > 0 && curKg + s.cantidad > capacity) {
                groups.push(cur);
                cur = [];
                curKg = 0;
            }
            cur.push(s);
            curKg += s.cantidad;
        }
        if (cur.length) groups.push(cur);
        return groups;
    },

    _minToHora(totalMin) {
        const d = new Date();
        d.setHours(this.HORA_INICIO, 0, 0, 0);
        d.setMinutes(d.getMinutes() + Math.round(totalMin));
        return d.toTimeString().slice(0, 5);
    },

    // =============== RENDERIZADO DEL RESULTADO ===============
    _paintRoute() {
        const r = this.state.currentRoute;
        const el = document.getElementById('routeResult');
        if (!el) return;
        if (!r) { el.innerHTML = ''; return; }

        const vehiculo = Storage.findById(Storage.KEYS.vehiculos, r.vehiculoId);
        const capacidad = vehiculo?.capacidad || 0;
        const multiTrip = r.trips && r.trips.length > 1;

        // Alertas según capacidad
        let alerta = '';
        if (vehiculo) {
            if (multiTrip) {
                alerta = `
                    <div class="alert alert-warning">
                        <i class="fa-solid fa-truck-arrow-right"></i>
                        <div>
                            <strong>RUTA DIVIDIDA EN ${r.trips.length} VIAJES</strong><br>
                            <small>La carga total (${Helpers.formatKg(r.totalKg)}) supera la capacidad del vehículo ${vehiculo.placa} (${Helpers.formatKg(capacidad)}).
                            El sistema propone <strong>${r.trips.length} tours</strong> con descarga intermedia en el centro de acopio (${this.TIEMPO_DESCARGA_DEPOT_MIN} min por descarga).</small>
                        </div>
                    </div>`;
            } else if (r.totalKg > capacidad) {
                const exceso = r.totalKg - capacidad;
                alerta = `
                    <div class="alert alert-danger">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <div>
                            <strong>EL VEHÍCULO NO CUMPLE CON LA CAPACIDAD REQUERIDA</strong><br>
                            <small>Capacidad: ${Helpers.formatKg(capacidad)} · Ruta: ${Helpers.formatKg(r.totalKg)} · Exceso: ${Helpers.formatKg(exceso)}.
                            Activa <strong>"Permitir múltiples viajes"</strong> para dividir automáticamente.</small>
                        </div>
                    </div>`;
            } else if ((r.totalKg / capacidad) > 0.85) {
                alerta = `
                    <div class="alert alert-warning">
                        <i class="fa-solid fa-circle-info"></i>
                        <div><strong>Capacidad próxima al límite</strong><br><small>Uso: ${((r.totalKg / capacidad) * 100).toFixed(1)}%</small></div>
                    </div>`;
            }
        }

        el.innerHTML = `
            ${alerta}
            <div class="kpi-grid">
                <div class="kpi-card kpi-cacao">
                    <div class="kpi-header"><span class="kpi-label">${multiTrip ? 'Viajes / Fincas' : 'Total Fincas'}</span><div class="kpi-icon"><i class="fa-solid fa-truck-fast"></i></div></div>
                    <div class="kpi-value">${multiTrip ? r.trips.length + ' / ' + r.stops.length : r.stops.length}</div>
                </div>
                <div class="kpi-card"><div class="kpi-header"><span class="kpi-label">Cacao a recolectar</span><div class="kpi-icon"><i class="fa-solid fa-weight-hanging"></i></div></div><div class="kpi-value">${Helpers.formatNumber(r.totalKg)}<span class="kpi-unit">kg</span></div></div>
                <div class="kpi-card kpi-info"><div class="kpi-header"><span class="kpi-label">Distancia total</span><div class="kpi-icon"><i class="fa-solid fa-route"></i></div></div><div class="kpi-value">${r.totalKm.toFixed(1)}<span class="kpi-unit">km</span></div></div>
                <div class="kpi-card kpi-warning"><div class="kpi-header"><span class="kpi-label">Tiempo total estimado</span><div class="kpi-icon"><i class="fa-regular fa-clock"></i></div></div><div class="kpi-value">${Math.floor(r.tiempoEstimadoMin / 60)}h ${r.tiempoEstimadoMin % 60}m</div></div>
            </div>

            ${vehiculo ? `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="flex-between">
                            <div>
                                <strong>Vehículo asignado:</strong> ${Helpers.escapeHtml(vehiculo.placa)} · ${Helpers.escapeHtml(vehiculo.marca)} ${Helpers.escapeHtml(vehiculo.modelo)}<br>
                                <small class="text-muted">Capacidad: ${Helpers.formatKg(vehiculo.capacidad)} · ${multiTrip ? 'Dividido en ' + r.trips.length + ' viajes' : 'Uso: ' + ((r.totalKg/capacidad)*100).toFixed(1) + '%'}</small>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}

            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${multiTrip ? `Recorridos (${r.trips.length} viajes)` : 'Recorrido secuencial'}</div>
                            <div class="card-subtitle">${multiTrip ? 'El vehículo descarga entre viajes en el centro de acopio' : 'Optimización por vecino más cercano'}</div>
                        </div>
                        <button class="btn btn-sm btn-outline" onclick="PDFGen.cronogramaRuta(RutasModule.state.currentRoute)"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                    </div>
                    <div class="card-body">
                        ${this._renderTrips(r, capacidad)}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Mapa de rutas</div>
                        ${multiTrip ? `<div class="card-subtitle">Cada color es un viaje</div>` : ''}
                    </div>
                    <div class="card-body" style="padding:0;">
                        <div id="rutaMap" class="map-container"></div>
                    </div>
                </div>
            </div>
        `;
        setTimeout(() => this._paintMap(), 80);
    },

    _renderTrips(r, capacidad) {
        return r.trips.map((trip, ti) => {
            const color = this.TRIP_COLORS[ti % this.TRIP_COLORS.length];
            const uso = capacidad ? (trip.kg / capacidad) * 100 : 0;
            const usoClass = uso > 100 ? 'over' : (uso > 85 ? 'warn' : '');
            return `
                <div class="trip-block">
                    <div class="trip-header">
                        <div class="trip-badge" style="background:${color};">VIAJE ${trip.num}</div>
                        <div class="trip-meta">
                            <strong>${trip.stops.length} fincas</strong> · ${Helpers.formatKg(trip.kg)} ·
                            ${trip.km.toFixed(1)} km · ${Math.floor(trip.timeMin/60)}h ${trip.timeMin%60}m
                            <br><small class="text-muted">Inicio ${trip.horaInicio} · Fin ${trip.horaFin}</small>
                        </div>
                    </div>
                    ${capacidad ? `<div class="capacity-bar"><div class="capacity-fill ${usoClass}" style="width:${Math.min(100, uso)}%; background:${color};"></div></div>` : ''}

                    <div class="route-stop" style="border:2px dashed var(--cacao-300); background:var(--beige-200); margin-top:8px;">
                        <div class="route-stop-num" style="background:linear-gradient(135deg, var(--cacao-700), var(--cacao-900));"><i class="fa-solid fa-warehouse"></i></div>
                        <div class="route-stop-info">
                            <strong>SALIDA del centro de acopio</strong>
                            <span>${trip.horaInicio}</span>
                        </div>
                    </div>
                    ${trip.stops.map((s, i) => `
                        <div class="route-stop">
                            <div class="route-stop-num" style="background:linear-gradient(135deg, ${color}, ${color}dd);">${i + 1}</div>
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
                    <div class="route-stop" style="border:2px dashed ${color}; background:rgba(0,0,0,.03);">
                        <div class="route-stop-num" style="background:${color};"><i class="fa-solid fa-flag-checkered"></i></div>
                        <div class="route-stop-info">
                            <strong>REGRESO al centro de acopio</strong>
                            <span>${trip.horaFin} · ${trip.km.toFixed(1)} km totales</span>
                        </div>
                    </div>
                    ${r.trips.length > 1 && ti < r.trips.length - 1 ? `
                        <div style="text-align:center; padding:8px; color:var(--text-muted); font-size:12px; border-left:2px dashed var(--border-color); margin-left:18px;">
                            <i class="fa-solid fa-arrows-spin"></i> Descarga en centro de acopio (~${this.TIEMPO_DESCARGA_DEPOT_MIN} min)
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },

    _paintMap() {
        const r = this.state.currentRoute;
        if (!r) return;
        if (this.state.map) { try { this.state.map.remove(); } catch(e){} this.state.map = null; }
        const map = L.map('rutaMap').setView([r.puntoSalida.lat, r.puntoSalida.lng], 11);
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
        const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' });
        L.control.layers({ 'Calles': osm, 'Satélite': sat }).addTo(map);

        const homeIcon = L.divIcon({ html: '<div style="background:#7a4f2a; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,.3); font-weight:bold;"><i class="fa-solid fa-warehouse"></i></div>', iconSize: [34, 34], iconAnchor: [17, 17] });
        L.marker([r.puntoSalida.lat, r.puntoSalida.lng], { icon: homeIcon }).addTo(map).bindPopup('Centro de acopio');

        const allCoords = [[r.puntoSalida.lat, r.puntoSalida.lng]];
        r.trips.forEach((trip, ti) => {
            const color = this.TRIP_COLORS[ti % this.TRIP_COLORS.length];
            const coords = [[r.puntoSalida.lat, r.puntoSalida.lng]];
            trip.stops.forEach((s, i) => {
                coords.push([s.lat, s.lng]);
                allCoords.push([s.lat, s.lng]);
                const icon = L.divIcon({
                    html: `<div style="background:${color}; color:white; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,.3); font-weight:bold; font-size:12px;">${r.trips.length > 1 ? trip.num + '.' : ''}${i + 1}</div>`,
                    iconSize: [32, 32], iconAnchor: [16, 16]
                });
                L.marker([s.lat, s.lng], { icon }).addTo(map).bindPopup(
                    `<strong>Viaje ${trip.num} · Parada ${i + 1}</strong><br>${Helpers.escapeHtml(s.fincaNombre)}<br>${Helpers.escapeHtml(s.propietario)}<br><small>${Helpers.formatKg(s.cantidad)} · ${s.horaEstimada}</small>`
                );
            });
            coords.push([r.puntoSalida.lat, r.puntoSalida.lng]);
            L.polyline(coords, { color, weight: 4, opacity: 0.75, dashArray: ti === 0 ? null : '10,6' }).addTo(map);
        });

        if (allCoords.length > 1) map.fitBounds(allCoords);
        this.state.map = map;
    },

    saveRoute() {
        const r = this.state.currentRoute;
        if (!r) { UI.toast('No hay ruta para guardar', 'warning'); return; }
        if (!r.vehiculoId) { UI.toast('Asigna un vehículo primero', 'warning'); return; }

        const v = Storage.findById(Storage.KEYS.vehiculos, r.vehiculoId);
        const tripsExceeded = r.trips.filter(t => v && t.kg > v.capacidad).length;

        if (tripsExceeded > 0) {
            UI.confirm({
                title: '¿Guardar con sobrecapacidad?',
                message: `${tripsExceeded} viaje(s) exceden la capacidad de ${v.placa}.`,
                danger: true, okText: 'Guardar de todos modos'
            }).then(ok => { if (ok) this._persistRoute(); });
            return;
        }
        this._persistRoute();
    },

    _persistRoute() {
        const r = this.state.currentRoute;
        const isNew = !r.id;
        const saved = isNew
            ? Storage.add(Storage.KEYS.rutas, r)
            : Storage.update(Storage.KEYS.rutas, r.id, r);

        // Actualizar estado de órdenes a "En ruta"
        r.stops.forEach(s => {
            const o = Storage.findById(Storage.KEYS.ordenes, s.ordenId);
            if (o && o.estado !== 'Recolectada' && o.estado !== 'Finalizada') {
                const prevEstado = o.estado;
                Storage.update(Storage.KEYS.ordenes, s.ordenId, { estado: 'En ruta', rutaId: saved.id });
                Audit.log({ entityType: 'orden', entityId: s.ordenId, entityNumero: o.numero,
                    action: 'asignar_ruta',
                    details: `Asignada a ruta ${saved.numero}`,
                    changes: [{ field: 'estado', before: prevEstado, after: 'En ruta' }] });
            }
        });

        // Audit ruta
        const veh = Storage.findById(Storage.KEYS.vehiculos, r.vehiculoId);
        if (isNew) {
            Audit.log({ entityType: 'ruta', entityId: saved.id, entityNumero: saved.numero,
                action: 'crear',
                details: `Ruta planificada · ${r.trips.length} viaje(s) · ${r.stops.length} fincas · ${Helpers.formatKg(r.totalKg)} · vehículo ${veh?.placa || '-'}`,
                changes: [] });
            if (r.trips.length > 1) {
                Audit.log({ entityType: 'ruta', entityId: saved.id, entityNumero: saved.numero,
                    action: 'multi_viaje',
                    details: `Dividida en ${r.trips.length} viajes por capacidad: ${r.trips.map(t => `V${t.num}: ${Helpers.formatKg(t.kg)}`).join(' · ')}`,
                    changes: [] });
            }
        }
        UI.toast(`Ruta ${saved.numero} guardada`, 'success');
        this.state.currentRoute = saved;
        this._paintRoute();
    },

    // =============== HISTORIAL / CALENDARIO / TABLERO ===============
    renderHistorial() {
        const list = Helpers.sortBy(Storage.list(Storage.KEYS.rutas).map(r => this._normalize(r)), 'fecha', false);
        if (!list.length) return UI.emptyState('route', 'Sin rutas guardadas', 'Aún no hay rutas guardadas en el historial.');
        const vehs = Object.fromEntries(Storage.list(Storage.KEYS.vehiculos).map(v => [v.id, v]));
        const rows = list.map(r => {
            const v = vehs[r.vehiculoId];
            const trips = r.trips || [{ stops: r.stops }];
            return `
                <tr>
                    <td><strong>${r.numero}</strong></td>
                    <td>${Helpers.formatDate(r.fecha)}</td>
                    <td>${v ? `${v.placa} · ${v.marca}` : '-'}</td>
                    <td>${trips.length > 1 ? `<span class="badge badge-warning">${trips.length} viajes</span>` : '<span class="badge badge-gray">1 viaje</span>'}</td>
                    <td>${r.stops.length} fincas</td>
                    <td>${Helpers.formatKg(r.totalKg)}</td>
                    <td>${(r.totalKm || 0).toFixed(1)} km</td>
                    <td>${Math.floor((r.tiempoEstimadoMin || 0) / 60)}h ${(r.tiempoEstimadoMin || 0) % 60}m</td>
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
                    <thead><tr><th>Número</th><th>Fecha</th><th>Vehículo</th><th>Viajes</th><th>Fincas</th><th>Cacao</th><th>Distancia</th><th>Tiempo</th><th style="width:120px;">Acciones</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },

    loadRoute(id) {
        const r = this._normalize(Storage.findById(Storage.KEYS.rutas, id));
        this.state.currentRoute = { ...r };
        this.state.fecha = r.fecha;
        this.state.vehiculoId = r.vehiculoId;
        this.state.multiTrip = !!r.multiTrip || (r.trips && r.trips.length > 1);
        this.state.view = 'planner';
        this.render();
    },

    async deleteRoute(id) {
        const ok = await UI.confirm({ title: '¿Eliminar ruta?', message: 'Las órdenes asociadas no se modificarán.' });
        if (!ok) return;
        const r = Storage.findById(Storage.KEYS.rutas, id);
        Storage.remove_item(Storage.KEYS.rutas, id);
        if (r) Audit.log({ entityType: 'ruta', entityId: id, entityNumero: r.numero,
            action: 'eliminar', details: 'Ruta eliminada', changes: [] });
        UI.toast('Ruta eliminada', 'success');
        this.renderView();
    },

    renderCalendario() {
        const rutas = Storage.list(Storage.KEYS.rutas).map(r => this._normalize(r));
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
            const tripsTotal = rs.reduce((a, b) => a + (b.trips?.length || 1), 0);
            cells += `
                <div class="calendar-day ${dateStr === today ? 'today' : ''}">
                    <div class="day-num">${d}</div>
                    ${rs.length > 0 ? `<div class="day-count">${tripsTotal} viaje${tripsTotal > 1 ? 's' : ''}</div><div style="font-size:10px; color:var(--text-muted); margin-top:4px;">${Helpers.formatKg(kg)}</div>` : ''}
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
        const rutas = Storage.list(Storage.KEYS.rutas).map(r => this._normalize(r));
        const proximas = Helpers.sortBy(rutas.filter(r => r.fecha >= today), 'fecha', true);
        const vehs = Object.fromEntries(Storage.list(Storage.KEYS.vehiculos).map(v => [v.id, v]));

        if (!proximas.length) return UI.emptyState('table-columns', 'Tablero vacío', 'No hay rutas programadas próximamente.');

        return `
            <div class="grid-2">
                ${proximas.map(r => {
                    const v = vehs[r.vehiculoId];
                    const tripsCount = r.trips?.length || 1;
                    return `
                        <div class="card">
                            <div class="card-header" style="background:linear-gradient(90deg, var(--green-100), transparent);">
                                <div>
                                    <div class="card-title">${r.numero} ${tripsCount > 1 ? `<span class="badge badge-warning">${tripsCount} viajes</span>` : ''}</div>
                                    <div class="card-subtitle">${Helpers.formatDate(r.fecha, {weekday:'long', day:'numeric', month:'long'})}</div>
                                </div>
                                <span class="badge badge-cacao">${r.stops.length} fincas</span>
                            </div>
                            <div class="card-body">
                                <p><strong>Vehículo:</strong> ${v ? `${v.placa} (${Helpers.formatKg(v.capacidad)})` : '<span class="text-warning">Sin asignar</span>'}</p>
                                <p><strong>Cacao total:</strong> ${Helpers.formatKg(r.totalKg)}</p>
                                <p><strong>Distancia:</strong> ${r.totalKm.toFixed(1)} km · <strong>Tiempo:</strong> ${Math.floor(r.tiempoEstimadoMin/60)}h ${r.tiempoEstimadoMin%60}m</p>
                                ${tripsCount > 1 ? `
                                    <div style="margin-top:8px; padding:8px; background:var(--bg-body); border-radius:6px; font-size:12px;">
                                        ${r.trips.map(t => `<div><span class="poly-dot" style="background:${this.TRIP_COLORS[(t.num-1) % this.TRIP_COLORS.length]};"></span> Viaje ${t.num}: ${Helpers.formatKg(t.kg)} · ${t.horaInicio}-${t.horaFin}</div>`).join('')}
                                    </div>
                                ` : ''}
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
