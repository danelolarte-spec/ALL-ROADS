/* ================================================================
   modules/dashboard.js — Dashboard ejecutivo
================================================================ */

const DashboardModule = {

    state: { charts: {} },

    render() {
        const container = document.getElementById('viewContainer');
        const fincas = Storage.list(Storage.KEYS.fincas);
        const ordenes = Storage.list(Storage.KEYS.ordenes);
        const vehiculos = Storage.list(Storage.KEYS.vehiculos);
        const notas = Storage.list(Storage.KEYS.notas);
        const rutas = Storage.list(Storage.KEYS.rutas);
        const prefacturas = Storage.list(Storage.KEYS.prefacturas);

        const today = Helpers.today();
        const ordHoy = ordenes.filter(o => o.fecha === today);
        const ordActivas = ordenes.filter(o => !['Finalizada', 'Recolectada'].includes(o.estado));
        const rutasHoy = rutas.filter(r => r.fecha === today);
        const totalKg = notas.reduce((a, b) => a + (b.pesoReal || 0), 0);
        const totalFacturado = prefacturas.reduce((a, b) => a + b.total, 0);

        const capacidadTotal = vehiculos.reduce((a, b) => a + b.capacidad, 0);

        // Documentos vencidos/por vencer
        const alertasDocs = [];
        vehiculos.forEach(v => {
            const soat = Helpers.docStatus(v.soatVence);
            const tec = Helpers.docStatus(v.tecnoVence);
            if (soat.color === 'red') alertasDocs.push({ vehiculo: v, doc: 'SOAT', estado: 'VENCIDO', dias: soat.days });
            else if (soat.color === 'yellow') alertasDocs.push({ vehiculo: v, doc: 'SOAT', estado: 'POR VENCER', dias: soat.days });
            if (tec.color === 'red') alertasDocs.push({ vehiculo: v, doc: 'Tecno', estado: 'VENCIDO', dias: tec.days });
            else if (tec.color === 'yellow') alertasDocs.push({ vehiculo: v, doc: 'Tecno', estado: 'POR VENCER', dias: tec.days });
        });

        container.innerHTML = `
            ${UI.pageHeader('Dashboard', 'Indicadores ejecutivos de operación', `<span class="badge badge-info"><i class="fa-regular fa-calendar"></i> ${Helpers.formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}</span>`)}

            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-label">Total Fincas</span><div class="kpi-icon"><i class="fa-solid fa-tree"></i></div></div>
                    <div class="kpi-value">${fincas.length}</div>
                    <div class="kpi-trend">${fincas.reduce((a,b)=>a+(b.hectareasProductivas||0),0).toFixed(1)} ha productivas</div>
                </div>
                <div class="kpi-card kpi-cacao">
                    <div class="kpi-header"><span class="kpi-label">Cacao recolectado</span><div class="kpi-icon"><i class="fa-solid fa-weight-hanging"></i></div></div>
                    <div class="kpi-value">${Helpers.formatNumber(totalKg)}<span class="kpi-unit">kg</span></div>
                    <div class="kpi-trend">${notas.length} recolecciones</div>
                </div>
                <div class="kpi-card kpi-info">
                    <div class="kpi-header"><span class="kpi-label">Órdenes activas</span><div class="kpi-icon"><i class="fa-solid fa-clipboard-list"></i></div></div>
                    <div class="kpi-value">${ordActivas.length}</div>
                    <div class="kpi-trend">${ordHoy.length} programadas hoy</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-label">Vehículos disponibles</span><div class="kpi-icon"><i class="fa-solid fa-truck"></i></div></div>
                    <div class="kpi-value">${vehiculos.length}</div>
                    <div class="kpi-trend">${Helpers.formatKg(capacidadTotal)} de capacidad total</div>
                </div>
                <div class="kpi-card kpi-warning">
                    <div class="kpi-header"><span class="kpi-label">Rutas hoy</span><div class="kpi-icon"><i class="fa-solid fa-route"></i></div></div>
                    <div class="kpi-value">${rutasHoy.length}</div>
                    <div class="kpi-trend">${Helpers.formatKg(rutasHoy.reduce((a, b) => a + b.totalKg, 0))} programados</div>
                </div>
                <div class="kpi-card kpi-cacao">
                    <div class="kpi-header"><span class="kpi-label">Valor en órdenes de compra</span><div class="kpi-icon"><i class="fa-solid fa-coins"></i></div></div>
                    <div class="kpi-value" style="font-size:22px;">${Helpers.formatCOP(totalFacturado)}</div>
                    <div class="kpi-trend">${prefacturas.length} órdenes de compra</div>
                </div>
                <div class="kpi-card ${alertasDocs.length ? 'kpi-danger' : ''}">
                    <div class="kpi-header"><span class="kpi-label">Alertas documentos</span><div class="kpi-icon"><i class="fa-solid fa-triangle-exclamation"></i></div></div>
                    <div class="kpi-value">${alertasDocs.length}</div>
                    <div class="kpi-trend ${alertasDocs.length ? 'down' : 'up'}">${alertasDocs.length ? 'Requieren atención' : 'Todo vigente'}</div>
                </div>
            </div>

            ${alertasDocs.length ? `
                <div class="card mb-3">
                    <div class="card-header">
                        <div class="card-title"><i class="fa-solid fa-triangle-exclamation text-warning"></i> Alertas de documentos</div>
                    </div>
                    <div class="card-body">
                        ${alertasDocs.map(a => `
                            <div class="alert ${a.estado === 'VENCIDO' ? 'alert-danger' : 'alert-warning'}">
                                <i class="fa-solid fa-${a.estado === 'VENCIDO' ? 'circle-xmark' : 'clock'}"></i>
                                <div>
                                    <strong>${Helpers.escapeHtml(a.vehiculo.placa)} · ${a.doc} ${a.estado}</strong><br>
                                    <small>${a.dias >= 0 ? `Vence en ${a.dias} días` : `Vencido hace ${Math.abs(a.dias)} días`}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="grid-2 mt-3">
                <div class="card">
                    <div class="card-header"><div class="card-title">Recolección por mes</div></div>
                    <div class="card-body"><div class="chart-wrap"><canvas id="dashChartMes"></canvas></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><div class="card-title">Top fincas por recolección</div></div>
                    <div class="card-body"><div class="chart-wrap"><canvas id="dashChartFincas"></canvas></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><div class="card-title">Calidad de cacao</div></div>
                    <div class="card-body"><div class="chart-wrap"><canvas id="dashChartCalidad"></canvas></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><div class="card-title">Mapa de fincas</div></div>
                    <div class="card-body" style="padding:0;"><div id="dashMap" class="map-container sm"></div></div>
                </div>
            </div>

            <div class="card mt-3">
                <div class="card-header">
                    <div class="card-title">Órdenes de hoy</div>
                    <button class="btn btn-sm btn-outline" onclick="App.navigate('ordenes')">Ver todas <i class="fa-solid fa-arrow-right"></i></button>
                </div>
                <div class="card-body">
                    ${ordHoy.length ? ordHoy.map(o => {
                        const f = fincas.find(x => x.id === o.fincaId);
                        return `
                            <div class="route-stop">
                                <div class="route-stop-num"><i class="fa-solid fa-clipboard"></i></div>
                                <div class="route-stop-info">
                                    <strong>${o.numero}</strong>
                                    <span>${f ? Helpers.escapeHtml(f.nombre) + ' · ' + Helpers.escapeHtml(f.propietario) : '-'}</span>
                                </div>
                                <div class="route-meta"><strong>${Helpers.formatKg(o.cantidad)}</strong><div>${OrdenesModule._estadoBadge(o.estado)}</div></div>
                            </div>
                        `;
                    }).join('') : '<p class="text-muted">No hay órdenes programadas para hoy.</p>'}
                </div>
            </div>
        `;

        setTimeout(() => this._drawCharts(notas, fincas), 80);
    },

    _drawCharts(notas, fincas) {
        Object.values(this.state.charts).forEach(c => c?.destroy?.());
        this.state.charts = {};

        // Por mes
        const mes = {};
        notas.forEach(n => {
            const m = (n.fechaReal || '').slice(0, 7);
            mes[m] = (mes[m] || 0) + (n.pesoReal || 0);
        });
        const mesLabels = Object.keys(mes).sort();
        this.state.charts.mes = new Chart(document.getElementById('dashChartMes'), {
            type: 'bar',
            data: { labels: mesLabels, datasets: [{ label: 'kg', data: mesLabels.map(k => mes[k]), backgroundColor: '#3b7a48', borderRadius: 6 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        // Top fincas
        const porFinca = {};
        notas.forEach(n => { porFinca[n.fincaId] = (porFinca[n.fincaId] || 0) + (n.pesoReal || 0); });
        const top = Object.entries(porFinca).sort((a, b) => b[1] - a[1]).slice(0, 6);
        const labels = top.map(([id]) => fincas.find(f => f.id === id)?.nombre || '?');
        this.state.charts.fincas = new Chart(document.getElementById('dashChartFincas'), {
            type: 'bar',
            data: { labels, datasets: [{ label: 'kg', data: top.map(([, kg]) => kg), backgroundColor: '#7a4f2a', borderRadius: 6 }] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        // Calidad
        const cal = { 'Estándar': 0, 'Premium': 0, 'Excelencia': 0 };
        notas.forEach(n => { cal[n.calidadReal] = (cal[n.calidadReal] || 0) + (n.pesoReal || 0); });
        this.state.charts.cal = new Chart(document.getElementById('dashChartCalidad'), {
            type: 'doughnut',
            data: { labels: Object.keys(cal), datasets: [{ data: Object.values(cal), backgroundColor: ['#9ca3af', '#d97706', '#6d28d9'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });

        // Mapa
        const config = Storage.get(Storage.KEYS.config);
        const punto = config.puntoSalida;
        const map = L.map('dashMap').setView([punto.lat, punto.lng], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
        L.marker([punto.lat, punto.lng]).addTo(map).bindPopup('Centro de acopio');
        fincas.forEach(f => {
            L.circleMarker([f.lat, f.lng], { radius: 8, color: '#3b7a48', fillColor: '#3b7a48', fillOpacity: 0.6 })
                .addTo(map).bindPopup(`<strong>${Helpers.escapeHtml(f.nombre)}</strong><br>${Helpers.escapeHtml(f.propietario)}`);
        });
        this.state.charts.map = map;
    }
};
