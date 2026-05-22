/* ================================================================
   modules/historico.js — Histórico por finca con gráficos
================================================================ */

const HistoricoModule = {

    state: { fincaId: null, charts: {} },

    render() {
        const container = document.getElementById('viewContainer');
        const fincas = Storage.list(Storage.KEYS.fincas);
        if (!this.state.fincaId && fincas.length) this.state.fincaId = fincas[0].id;

        container.innerHTML = `
            ${UI.pageHeader('Histórico por finca', 'Analítica visual de recolecciones por finca', `
                <button class="btn btn-outline" onclick="HistoricoModule.exportPDF()"><i class="fa-solid fa-file-pdf"></i> PDF</button>
                <select id="histFincaSel" onchange="HistoricoModule.openFinca(this.value)">
                    ${fincas.map(f => `<option value="${f.id}" ${this.state.fincaId === f.id ? 'selected' : ''}>${Helpers.escapeHtml(f.nombre)}</option>`).join('')}
                </select>
            `)}
            <div id="histView"></div>
        `;
        this.renderView();
    },

    openFinca(id) {
        this.state.fincaId = id;
        this.render();
    },

    _stats(fincaId) {
        const notas = Storage.list(Storage.KEYS.notas).filter(n => n.fincaId === fincaId);
        const totalKg = notas.reduce((a, b) => a + (b.pesoReal || 0), 0);
        const promedio = notas.length ? totalKg / notas.length : 0;

        const calMap = { 'Estándar': 1, 'Premium': 2, 'Excelencia': 3 };
        const calRev = { 1: 'Estándar', 2: 'Premium', 3: 'Excelencia' };
        const calAvg = notas.length ? notas.reduce((a, b) => a + (calMap[b.calidadReal] || 1), 0) / notas.length : 0;
        const calidadPromedio = calRev[Math.round(calAvg)] || '-';

        const ultimaFecha = notas.length ? Helpers.sortBy(notas, 'fechaReal', false)[0].fechaReal : null;

        // Por mes
        const mensual = {};
        notas.forEach(n => {
            const m = (n.fechaReal || '').slice(0, 7);
            mensual[m] = (mensual[m] || 0) + (n.pesoReal || 0);
        });
        // Por año
        const anual = {};
        notas.forEach(n => {
            const y = (n.fechaReal || '').slice(0, 4);
            anual[y] = (anual[y] || 0) + (n.pesoReal || 0);
        });
        // Por clon
        const porClon = {};
        notas.forEach(n => {
            (n.clones || []).forEach(c => {
                porClon[c] = (porClon[c] || 0) + (n.pesoReal || 0) / Math.max(1, (n.clones || []).length);
            });
        });

        return { notas, totalKg, totalRecolecciones: notas.length, promedio, calidadPromedio, ultimaFecha, mensual, anual, porClon };
    },

    renderView() {
        const finca = Storage.findById(Storage.KEYS.fincas, this.state.fincaId);
        if (!finca) {
            document.getElementById('histView').innerHTML = UI.emptyState('chart-line', 'Sin finca seleccionada', 'Selecciona una finca para ver su histórico.');
            return;
        }
        const stats = this._stats(finca.id);

        document.getElementById('histView').innerHTML = `
            <div class="kpi-grid">
                <div class="kpi-card"><div class="kpi-header"><span class="kpi-label">Total recolectado</span><div class="kpi-icon"><i class="fa-solid fa-weight-hanging"></i></div></div><div class="kpi-value">${Helpers.formatNumber(stats.totalKg)}<span class="kpi-unit">kg</span></div></div>
                <div class="kpi-card kpi-info"><div class="kpi-header"><span class="kpi-label">Recolecciones</span><div class="kpi-icon"><i class="fa-solid fa-truck-fast"></i></div></div><div class="kpi-value">${stats.totalRecolecciones}</div></div>
                <div class="kpi-card kpi-cacao"><div class="kpi-header"><span class="kpi-label">Promedio</span><div class="kpi-icon"><i class="fa-solid fa-chart-simple"></i></div></div><div class="kpi-value">${Helpers.formatNumber(stats.promedio, 0)}<span class="kpi-unit">kg</span></div></div>
                <div class="kpi-card kpi-warning"><div class="kpi-header"><span class="kpi-label">Calidad promedio</span><div class="kpi-icon"><i class="fa-solid fa-star"></i></div></div><div class="kpi-value" style="font-size:18px;">${stats.calidadPromedio}</div></div>
            </div>

            <div class="grid-2 mt-3">
                <div class="card">
                    <div class="card-header"><div class="card-title">Recolección mensual</div></div>
                    <div class="card-body"><div class="chart-wrap"><canvas id="histChartMensual"></canvas></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><div class="card-title">Recolección anual</div></div>
                    <div class="card-body"><div class="chart-wrap"><canvas id="histChartAnual"></canvas></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><div class="card-title">Distribución por clon</div></div>
                    <div class="card-body"><div class="chart-wrap"><canvas id="histChartClones"></canvas></div></div>
                </div>
                <div class="card">
                    <div class="card-header"><div class="card-title">Línea de tiempo</div></div>
                    <div class="card-body" style="max-height:320px; overflow-y:auto;">
                        <div class="timeline">
                            ${stats.notas.length ? Helpers.sortBy(stats.notas, 'fechaReal', false).map(n => `
                                <div class="timeline-item">
                                    <strong>${n.numero} · ${Helpers.formatKg(n.pesoReal)}</strong>
                                    <span>${Helpers.formatDate(n.fechaReal)} · ${n.calidadReal}</span>
                                    <p>${Helpers.escapeHtml(n.observaciones || 'Sin observaciones')}</p>
                                </div>
                            `).join('') : '<p class="text-muted">Sin recolecciones registradas</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => this._drawCharts(stats), 80);
    },

    _drawCharts(stats) {
        Object.values(this.state.charts).forEach(c => c?.destroy?.());
        this.state.charts = {};

        const mensualLabels = Object.keys(stats.mensual).sort();
        const mensualData = mensualLabels.map(k => stats.mensual[k]);
        this.state.charts.mensual = new Chart(document.getElementById('histChartMensual'), {
            type: 'bar',
            data: {
                labels: mensualLabels.map(l => l.slice(2)),
                datasets: [{ label: 'kg', data: mensualData, backgroundColor: '#7a4f2a', borderRadius: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        const anualLabels = Object.keys(stats.anual).sort();
        this.state.charts.anual = new Chart(document.getElementById('histChartAnual'), {
            type: 'line',
            data: {
                labels: anualLabels,
                datasets: [{
                    label: 'kg recolectados',
                    data: anualLabels.map(k => stats.anual[k]),
                    fill: true,
                    backgroundColor: 'rgba(59,122,72,0.2)',
                    borderColor: '#3b7a48',
                    tension: 0.3,
                    pointBackgroundColor: '#3b7a48'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const cloneLabels = Object.keys(stats.porClon);
        this.state.charts.clones = new Chart(document.getElementById('histChartClones'), {
            type: 'doughnut',
            data: {
                labels: cloneLabels.length ? cloneLabels : ['Sin datos'],
                datasets: [{
                    data: cloneLabels.length ? cloneLabels.map(c => stats.porClon[c]) : [1],
                    backgroundColor: ['#3b7a48', '#7a4f2a', '#b88a5c', '#6bb377', '#d4a877', '#2a5734', '#9a6b3f']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    },

    exportPDF() {
        const finca = Storage.findById(Storage.KEYS.fincas, this.state.fincaId);
        if (!finca) { UI.toast('Selecciona una finca primero', 'warning'); return; }
        const stats = this._stats(finca.id);
        PDFGen.historicoFinca(finca, stats, Helpers.sortBy(stats.notas, 'fechaReal', false));
    }
};
