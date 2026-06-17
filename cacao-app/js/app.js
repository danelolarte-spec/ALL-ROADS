/* ================================================================
   app.js — Orquestador principal de Smart Cacao
================================================================ */

const App = {

    currentView: 'dashboard',

    VIEWS: {
        dashboard:   { title: 'Dashboard', module: () => DashboardModule },
        fincas:      { title: 'Fincas', module: () => FincasModule },
        ordenes:     { title: 'Órdenes de Servicio', module: () => OrdenesModule },
        rutas:       { title: 'Planificador de Rutas', module: () => RutasModule },
        vehiculos:   { title: 'Vehículos', module: () => VehiculosModule },
        notas:       { title: 'Notas de Recolección', module: () => NotasModule },
        historico:   { title: 'Histórico por Finca', module: () => HistoricoModule },
        prefacturas: { title: 'Órdenes de Compra', module: () => PrefacturasModule },
        auditoria:   { title: 'Auditoría', module: () => AuditoriaModule },
        config:      { title: 'Configuración', module: () => ConfigModule }
    },

    init() {
        // Sembrar datos en primer arranque
        Storage.seedIfEmpty();

        // Cargar tema guardado
        const theme = localStorage.getItem('smartcacao_theme') || 'light';
        if (theme === 'dark') document.body.classList.add('dark');
        this._refreshThemeIcon();

        // Fecha actual + usuario activo
        document.getElementById('currentDate').textContent = Helpers.formatDate(Helpers.today(), { weekday: 'long', day: 'numeric', month: 'long' });
        const cfg = Storage.get(Storage.KEYS.config, {});
        document.getElementById('topbarUser').textContent = cfg.currentUser || 'Administrador';

        // Listeners navegación
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(item.getAttribute('data-view'));
                // En móvil cerrar sidebar
                document.getElementById('sidebar').classList.remove('open');
            });
        });

        // Sidebar toggle (móvil)
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const isDark = document.body.classList.contains('dark');
            localStorage.setItem('smartcacao_theme', isDark ? 'dark' : 'light');
            this._refreshThemeIcon();
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => UI.closeModal());
        document.getElementById('modalContainer').addEventListener('click', (e) => {
            if (e.target.id === 'modalContainer') UI.closeModal();
        });

        // Búsqueda global (solo al presionar Enter)
        const search = document.getElementById('globalSearch');
        search.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this._globalSearch(search.value);
            }
        });

        // Notificaciones
        document.getElementById('notifBtn').addEventListener('click', () => this._showNotifications());
        this._updateNotifBadge();

        // Hash routing simple
        window.addEventListener('hashchange', () => {
            const view = window.location.hash.replace('#', '') || 'dashboard';
            if (this.VIEWS[view]) this.navigate(view);
        });
        const initialView = window.location.hash.replace('#', '') || 'dashboard';
        this.navigate(this.VIEWS[initialView] ? initialView : 'dashboard');

        // Ocultar loader
        setTimeout(() => {
            UI.hideLoader();
            UI.toast('Bienvenido a Smart Cacao', 'success', 'Sistema cargado');
        }, 800);
    },

    navigate(view) {
        if (!this.VIEWS[view]) view = 'dashboard';
        this.currentView = view;
        window.location.hash = view;

        // Actualizar nav activo
        document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.getAttribute('data-view') === view));
        document.getElementById('breadcrumbView').textContent = this.VIEWS[view].title;

        // Renderizar módulo
        try {
            this.VIEWS[view].module().render();
        } catch (err) {
            console.error('Error renderizando vista', view, err);
            document.getElementById('viewContainer').innerHTML = UI.emptyState('triangle-exclamation', 'Error', 'No se pudo cargar la vista: ' + err.message);
        }
    },

    _refreshThemeIcon() {
        const btn = document.getElementById('themeToggle');
        btn.innerHTML = document.body.classList.contains('dark')
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    },

    _updateNotifBadge() {
        const vehs = Storage.list(Storage.KEYS.vehiculos);
        let cnt = 0;
        vehs.forEach(v => {
            if (['red', 'yellow'].includes(Helpers.docStatus(v.soatVence).color)) cnt++;
            if (['red', 'yellow'].includes(Helpers.docStatus(v.tecnoVence).color)) cnt++;
        });
        const today = Helpers.today();
        const pend = Storage.list(Storage.KEYS.ordenes).filter(o => o.fecha === today && o.estado === 'Pendiente').length;
        cnt += pend;
        const badge = document.getElementById('notifBadge');
        badge.textContent = cnt;
        badge.style.display = cnt > 0 ? 'flex' : 'none';
    },

    _showNotifications() {
        const vehs = Storage.list(Storage.KEYS.vehiculos);
        const items = [];
        vehs.forEach(v => {
            const soat = Helpers.docStatus(v.soatVence);
            const tec = Helpers.docStatus(v.tecnoVence);
            if (soat.color === 'red') items.push({ type: 'danger', icon: 'circle-xmark', text: `${v.placa} — SOAT vencido hace ${Math.abs(soat.days)} días` });
            else if (soat.color === 'yellow') items.push({ type: 'warning', icon: 'clock', text: `${v.placa} — SOAT vence en ${soat.days} días` });
            if (tec.color === 'red') items.push({ type: 'danger', icon: 'circle-xmark', text: `${v.placa} — Tecno vencida hace ${Math.abs(tec.days)} días` });
            else if (tec.color === 'yellow') items.push({ type: 'warning', icon: 'clock', text: `${v.placa} — Tecno vence en ${tec.days} días` });
        });
        const today = Helpers.today();
        const ordPend = Storage.list(Storage.KEYS.ordenes).filter(o => o.fecha === today && o.estado === 'Pendiente');
        ordPend.forEach(o => items.push({ type: 'info', icon: 'clipboard', text: `${o.numero} — Pendiente de confirmar (hoy)` }));

        UI.openModal({
            title: 'Notificaciones',
            size: 'sm',
            body: items.length
                ? items.map(i => `<div class="alert alert-${i.type === 'danger' ? 'danger' : (i.type === 'warning' ? 'warning' : 'info')}"><i class="fa-solid fa-${i.icon}"></i><div>${Helpers.escapeHtml(i.text)}</div></div>`).join('')
                : '<p class="text-muted text-center">No hay notificaciones pendientes.</p>',
            footer: `<button class="btn btn-primary" onclick="UI.closeModal()">Cerrar</button>`
        });
    },

    _globalSearch(query) {
        if (!query || query.length < 2) return;
        const q = query.toLowerCase();
        const fincas = Storage.list(Storage.KEYS.fincas).filter(f =>
            f.nombre.toLowerCase().includes(q) || f.propietario.toLowerCase().includes(q) || (f.cedula || '').includes(q));
        const ordenes = Storage.list(Storage.KEYS.ordenes).filter(o => o.numero.toLowerCase().includes(q));
        const vehiculos = Storage.list(Storage.KEYS.vehiculos).filter(v => v.placa.toLowerCase().includes(q));

        const totalResults = fincas.length + ordenes.length + vehiculos.length;
        if (totalResults === 0) {
            UI.toast(`Sin resultados para "${query}"`, 'info');
            return;
        }

        UI.openModal({
            title: `Búsqueda: "${query}" (${totalResults})`,
            body: `
                ${fincas.length ? `
                    <h4 style="color:var(--cacao-700); margin-bottom:10px;"><i class="fa-solid fa-tree"></i> Fincas (${fincas.length})</h4>
                    ${fincas.map(f => `<a href="#" onclick="UI.closeModal(); App.navigate('fincas'); FincasModule.viewDetail('${f.id}'); return false;" style="display:block; padding:8px; border-bottom:1px solid var(--border-color); color:var(--text-primary);"><strong>${Helpers.escapeHtml(f.nombre)}</strong> · ${Helpers.escapeHtml(f.propietario)}</a>`).join('')}
                ` : ''}
                ${ordenes.length ? `
                    <h4 style="color:var(--cacao-700); margin:14px 0 10px;"><i class="fa-solid fa-clipboard-list"></i> Órdenes (${ordenes.length})</h4>
                    ${ordenes.map(o => `<a href="#" onclick="UI.closeModal(); App.navigate('ordenes'); OrdenesModule.viewDetail('${o.id}'); return false;" style="display:block; padding:8px; border-bottom:1px solid var(--border-color); color:var(--text-primary);"><strong>${Helpers.escapeHtml(o.numero)}</strong> · ${Helpers.formatDate(o.fecha)} · ${Helpers.formatKg(o.cantidad)}</a>`).join('')}
                ` : ''}
                ${vehiculos.length ? `
                    <h4 style="color:var(--cacao-700); margin:14px 0 10px;"><i class="fa-solid fa-truck"></i> Vehículos (${vehiculos.length})</h4>
                    ${vehiculos.map(v => `<a href="#" onclick="UI.closeModal(); App.navigate('vehiculos'); return false;" style="display:block; padding:8px; border-bottom:1px solid var(--border-color); color:var(--text-primary);"><strong>${Helpers.escapeHtml(v.placa)}</strong> · ${Helpers.escapeHtml(v.marca)} ${Helpers.escapeHtml(v.modelo)}</a>`).join('')}
                ` : ''}
            `,
            footer: `<button class="btn btn-ghost" onclick="UI.closeModal()">Cerrar</button>`
        });
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
