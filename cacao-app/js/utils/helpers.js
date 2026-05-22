/* ================================================================
   helpers.js — utilidades globales
================================================================ */

const Helpers = {

    // ---- IDs ----
    uid(prefix = 'id') {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    },

    // ---- Fechas ----
    today() {
        return new Date().toISOString().slice(0, 10);
    },
    now() {
        return new Date().toISOString();
    },
    formatDate(iso, opts = {}) {
        if (!iso) return '-';
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        const o = { day: '2-digit', month: 'short', year: 'numeric', ...opts };
        return d.toLocaleDateString('es-CO', o);
    },
    formatDateTime(iso) {
        if (!iso) return '-';
        const d = new Date(iso);
        if (isNaN(d)) return iso;
        return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },
    diffDays(iso) {
        if (!iso) return null;
        const d = new Date(iso);
        const t = new Date();
        d.setHours(0,0,0,0); t.setHours(0,0,0,0);
        return Math.round((d - t) / (1000 * 60 * 60 * 24));
    },

    // ---- Números / moneda ----
    formatNumber(n, decimals = 0) {
        if (n === null || n === undefined || isNaN(n)) return '0';
        return Number(n).toLocaleString('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    },
    formatCOP(n) {
        if (n === null || n === undefined || isNaN(n)) return '$ 0';
        return '$ ' + Number(n).toLocaleString('es-CO', { maximumFractionDigits: 0 });
    },
    formatKg(n) { return Helpers.formatNumber(n, 0) + ' kg'; },

    // ---- Geo / distancia ----
    haversineKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    },

    // Nearest neighbor TSP heurística (suficiente local)
    optimizeRoute(start, points) {
        const remaining = points.slice();
        const route = [];
        let current = start;
        let total = 0;
        while (remaining.length) {
            let bestIdx = 0;
            let bestDist = Infinity;
            for (let i = 0; i < remaining.length; i++) {
                const d = Helpers.haversineKm(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
                if (d < bestDist) { bestDist = d; bestIdx = i; }
            }
            const next = remaining.splice(bestIdx, 1)[0];
            total += bestDist;
            route.push({ ...next, distance: bestDist });
            current = next;
        }
        // Distancia de regreso
        const back = Helpers.haversineKm(current.lat, current.lng, start.lat, start.lng);
        total += back;
        return { stops: route, totalKm: total, returnKm: back };
    },

    // ---- Validación ----
    required(value) {
        return value !== null && value !== undefined && String(value).trim() !== '';
    },
    isNumber(v) { return !isNaN(parseFloat(v)) && isFinite(v); },

    // ---- Texto ----
    slug(s) {
        return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    },
    truncate(s, n = 40) {
        if (!s) return '';
        return s.length > n ? s.slice(0, n) + '…' : s;
    },
    escapeHtml(s) {
        if (s === null || s === undefined) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // ---- Array / sort ----
    sortBy(arr, key, asc = true) {
        return arr.slice().sort((a, b) => {
            const av = a[key]; const bv = b[key];
            if (av === bv) return 0;
            if (av === null || av === undefined) return 1;
            if (bv === null || bv === undefined) return -1;
            const cmp = (typeof av === 'string') ? av.localeCompare(bv) : (av < bv ? -1 : 1);
            return asc ? cmp : -cmp;
        });
    },

    // ---- Estados semáforo ----
    docStatus(fechaVencISO) {
        const days = Helpers.diffDays(fechaVencISO);
        if (days === null) return { color: 'gray', label: 'Sin fecha', days: null };
        if (days < 0) return { color: 'red', label: 'Vencido', days };
        if (days <= 30) return { color: 'yellow', label: 'Por vencer', days };
        return { color: 'green', label: 'Vigente', days };
    }
};
