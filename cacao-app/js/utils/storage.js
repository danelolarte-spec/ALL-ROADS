/* ================================================================
   storage.js — Persistencia local sobre LocalStorage
================================================================ */

const Storage = {
    PREFIX: 'cacaoflow_',
    KEYS: {
        fincas: 'fincas',
        clones: 'clones',
        ordenes: 'ordenes',
        vehiculos: 'vehiculos',
        rutas: 'rutas',
        notas: 'notas',
        prefacturas: 'prefacturas',
        config: 'config',
        meta: 'meta'
    },

    _k(key) { return this.PREFIX + key; },

    get(key, fallback = []) {
        try {
            const raw = localStorage.getItem(this._k(key));
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            console.error('Storage.get error', e);
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this._k(key), JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage.set error', e);
            return false;
        }
    },

    remove(key) { localStorage.removeItem(this._k(key)); },

    clearAll() {
        Object.values(this.KEYS).forEach(k => this.remove(k));
    },

    // ---- CRUD genérico sobre listas ----
    list(key) { return this.get(key, []); },

    findById(key, id) {
        return this.list(key).find(item => item.id === id) || null;
    },

    add(key, item) {
        const data = this.list(key);
        if (!item.id) item.id = Helpers.uid(key.slice(0, 3));
        if (!item.createdAt) item.createdAt = Helpers.now();
        data.push(item);
        this.set(key, data);
        return item;
    },

    update(key, id, patch) {
        const data = this.list(key);
        const idx = data.findIndex(x => x.id === id);
        if (idx === -1) return null;
        data[idx] = { ...data[idx], ...patch, updatedAt: Helpers.now() };
        this.set(key, data);
        return data[idx];
    },

    remove_item(key, id) {
        const data = this.list(key).filter(x => x.id !== id);
        this.set(key, data);
        return true;
    },

    // ---- Inicialización con datos mock ----
    seedIfEmpty() {
        const meta = this.get(this.KEYS.meta, null);
        if (meta && meta.seeded) return false;

        // Sembrar todas las colecciones desde MockData
        this.set(this.KEYS.clones, MockData.clones);
        this.set(this.KEYS.fincas, MockData.fincas);
        this.set(this.KEYS.vehiculos, MockData.vehiculos);
        this.set(this.KEYS.ordenes, MockData.ordenes);
        this.set(this.KEYS.rutas, []);
        this.set(this.KEYS.notas, MockData.notas || []);
        this.set(this.KEYS.prefacturas, MockData.prefacturas || []);
        this.set(this.KEYS.config, {
            precios: {
                seco_estandar: 9500,
                seco_premium: 11500,
                seco_excelencia: 13500,
                baba_estandar: 4500,
                baba_premium: 5500,
                baba_excelencia: 6500
            },
            empresa: {
                nombre: 'Smart Cacao Arauquita',
                nit: '900.123.456-7',
                direccion: 'Corregimiento El Troncal, Arauquita - Arauca',
                telefono: '+57 320 555 0123',
                email: 'contacto@smartcacao.co'
            },
            puntoSalida: {
                nombre: 'Centro de Acopio El Troncal',
                lat: 7.0292,
                lng: -71.4475
            }
        });
        this.set(this.KEYS.meta, { seeded: true, seedDate: Helpers.now() });
        return true;
    },

    // ---- Export / import ----
    exportAll() {
        const data = {};
        Object.entries(this.KEYS).forEach(([k, v]) => { data[k] = this.get(v); });
        return data;
    },

    importAll(data) {
        Object.entries(data).forEach(([k, v]) => {
            if (this.KEYS[k]) this.set(this.KEYS[k], v);
        });
    }
};
