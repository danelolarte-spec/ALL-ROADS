/* ================================================================
   modules/prefacturas.js — Órdenes de Compra generadas desde notas
================================================================ */

const PrefacturasModule = {

    state: { search: '' },

    nextNumero() {
        const list = Storage.list(Storage.KEYS.prefacturas);
        const year = new Date().getFullYear();
        const max = list.map(p => parseInt((p.numero || '').split('-').pop()) || 0).reduce((a, b) => Math.max(a, b), 0);
        return `OC-${year}-${String(max + 1).padStart(4, '0')}`;
    },

    // ===== Generación automática =====
    generarDesdeNota(nota) {
        const existing = Storage.list(Storage.KEYS.prefacturas).find(p => p.notaId === nota.id);
        if (existing) return existing;
        const config = Storage.get(Storage.KEYS.config, {});
        const precios = config.precios || {};
        const key = (nota.tipoCacao || '').toLowerCase().includes('seco') ? 'seco' : 'baba';
        const calKey = (nota.calidadReal || 'Estándar').toLowerCase()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
        const priceKey = `${key}_${calKey}`;
        const precioKg = precios[priceKey] || 5000;
        const oc = {
            numero: this.nextNumero(),
            notaId: nota.id,
            fincaId: nota.fincaId,
            fecha: nota.fechaReal,
            tipoCacao: nota.tipoCacao,
            cantidad: nota.pesoReal,
            calidad: nota.calidadReal,
            precioKg,
            total: nota.pesoReal * precioKg,
            estado: 'Generada'
        };
        return Storage.add(Storage.KEYS.prefacturas, oc);
    },

    render() {
        const container = document.getElementById('viewContainer');
        container.innerHTML = `
            ${UI.pageHeader('Órdenes de Compra', 'Documentos generados automáticamente desde las notas de recolección', `
                <button class="btn btn-outline" onclick="PrefacturasModule.exportExcel()"><i class="fa-solid fa-file-excel"></i> Excel</button>
            `)}
            <div id="prefView"></div>
        `;
        this.renderView();
    },

    renderView() {
        const list = Helpers.sortBy(Storage.list(Storage.KEYS.prefacturas), 'fecha', false);
        const fincas = Object.fromEntries(Storage.list(Storage.KEYS.fincas).map(f => [f.id, f]));

        const totalGeneral = list.reduce((a, b) => a + b.total, 0);

        const rows = list.map(p => {
            const f = fincas[p.fincaId];
            return `
                <tr>
                    <td><strong>${p.numero}</strong></td>
                    <td>${Helpers.formatDate(p.fecha)}</td>
                    <td>${f ? Helpers.escapeHtml(f.nombre) : '-'}<br><small class="text-muted">${f ? Helpers.escapeHtml(f.propietario) : ''}</small></td>
                    <td>${p.tipoCacao}</td>
                    <td>${p.calidad}</td>
                    <td>${Helpers.formatNumber(p.cantidad)} kg</td>
                    <td>${Helpers.formatCOP(p.precioKg)}</td>
                    <td><strong>${Helpers.formatCOP(p.total)}</strong></td>
                    <td>
                        <div class="row-actions">
                            <button onclick="PrefacturasModule.viewDetail('${p.id}')"><i class="fa-solid fa-eye"></i></button>
                            <button onclick="PDFGen.ordenCompra(Storage.findById(Storage.KEYS.prefacturas,'${p.id}'))"><i class="fa-solid fa-file-pdf"></i></button>
                            <button onclick="window.print()"><i class="fa-solid fa-print"></i></button>
                            <button class="danger" onclick="PrefacturasModule.deletePref('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('prefView').innerHTML = `
            <div class="kpi-grid">
                <div class="kpi-card kpi-cacao">
                    <div class="kpi-header"><span class="kpi-label">Total a pagar</span><div class="kpi-icon"><i class="fa-solid fa-file-invoice-dollar"></i></div></div>
                    <div class="kpi-value" style="font-size:22px;">${Helpers.formatCOP(totalGeneral)}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header"><span class="kpi-label">Total Órdenes de Compra</span><div class="kpi-icon"><i class="fa-solid fa-file-lines"></i></div></div>
                    <div class="kpi-value">${list.length}</div>
                </div>
                <div class="kpi-card kpi-info">
                    <div class="kpi-header"><span class="kpi-label">Cacao comprado</span><div class="kpi-icon"><i class="fa-solid fa-weight-hanging"></i></div></div>
                    <div class="kpi-value">${Helpers.formatNumber(list.reduce((a, b) => a + b.cantidad, 0))}<span class="kpi-unit">kg</span></div>
                </div>
            </div>
            <div class="table-wrap">
                <div class="table-toolbar"><strong>Órdenes de Compra registradas</strong><span class="text-muted" style="margin-left:auto;">${list.length}</span></div>
                <table class="data-table">
                    <thead><tr><th>Número</th><th>Fecha</th><th>Productor / Finca</th><th>Tipo</th><th>Calidad</th><th>Cantidad</th><th>Precio/kg</th><th>Total</th><th style="width:160px;">Acciones</th></tr></thead>
                    <tbody>${rows || `<tr><td colspan="9">${UI.emptyState('file-invoice-dollar','Sin órdenes de compra','Las órdenes de compra se generan automáticamente cuando creas una nota de recolección.')}</td></tr>`}</tbody>
                </table>
            </div>
        `;
    },

    viewDetail(id) {
        const p = Storage.findById(Storage.KEYS.prefacturas, id);
        const f = Storage.findById(Storage.KEYS.fincas, p.fincaId);
        const config = Storage.get(Storage.KEYS.config, {});
        const empresa = config.empresa || {};

        UI.openModal({
            title: `Orden de Compra ${p.numero}`,
            size: 'lg',
            body: `
                <div class="invoice">
                    <div class="invoice-header">
                        <div>
                            <h1>${Helpers.escapeHtml(empresa.nombre || 'CacaoFlow')}</h1>
                            <div class="invoice-num">NIT: ${Helpers.escapeHtml(empresa.nit || '')}</div>
                            <div class="invoice-num">${Helpers.escapeHtml(empresa.direccion || '')}</div>
                        </div>
                        <div style="text-align:right;">
                            <h1 style="color:var(--green-700);">ORDEN DE COMPRA</h1>
                            <div class="invoice-num">${p.numero}</div>
                            <div class="invoice-num">Fecha: ${Helpers.formatDate(p.fecha)}</div>
                        </div>
                    </div>
                    <div class="invoice-meta">
                        <div>
                            <strong>Productor</strong>
                            <span>${f ? Helpers.escapeHtml(f.propietario) : '-'}</span><br>
                            <span>CC ${f ? Helpers.escapeHtml(f.cedula) : '-'}</span><br>
                            <span>${f ? Helpers.escapeHtml(f.telefono) : '-'}</span>
                        </div>
                        <div>
                            <strong>Finca</strong>
                            <span>${f ? Helpers.escapeHtml(f.nombre) : '-'}</span><br>
                            <span>${f ? Helpers.escapeHtml(f.vereda) + ', ' + Helpers.escapeHtml(f.municipio) : '-'}</span>
                        </div>
                    </div>
                    <table class="invoice-table">
                        <thead>
                            <tr><th>Concepto</th><th>Tipo</th><th>Calidad</th><th style="text-align:right;">Cantidad</th><th style="text-align:right;">Precio/kg</th><th style="text-align:right;">Subtotal</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Compra de cacao</td>
                                <td>${p.tipoCacao}</td>
                                <td>${p.calidad}</td>
                                <td style="text-align:right;">${Helpers.formatNumber(p.cantidad)} kg</td>
                                <td style="text-align:right;">${Helpers.formatCOP(p.precioKg)}</td>
                                <td style="text-align:right;">${Helpers.formatCOP(p.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="invoice-totals">
                        <div class="row"><span>Subtotal:</span><span>${Helpers.formatCOP(p.total)}</span></div>
                        <div class="row total"><span>TOTAL A PAGAR:</span><span>${Helpers.formatCOP(p.total)}</span></div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-ghost" onclick="UI.closeModal()">Cerrar</button>
                <button class="btn btn-primary" onclick="PDFGen.ordenCompra(Storage.findById(Storage.KEYS.prefacturas,'${p.id}'))"><i class="fa-solid fa-file-pdf"></i> Descargar PDF</button>
                <button class="btn btn-secondary" onclick="window.print()"><i class="fa-solid fa-print"></i> Imprimir</button>
            `
        });
    },

    async deletePref(id) {
        const ok = await UI.confirm({ title: '¿Eliminar Orden de Compra?', message: 'La nota asociada no se eliminará.' });
        if (!ok) return;
        Storage.remove_item(Storage.KEYS.prefacturas, id);
        UI.toast('Orden de Compra eliminada', 'success');
        this.render();
    },

    exportExcel() {
        const list = Storage.list(Storage.KEYS.prefacturas);
        const fincas = Object.fromEntries(Storage.list(Storage.KEYS.fincas).map(f => [f.id, f]));
        const ws = XLSX.utils.json_to_sheet(list.map(p => ({
            Número: p.numero, Fecha: p.fecha, Productor: fincas[p.fincaId]?.propietario,
            Finca: fincas[p.fincaId]?.nombre, Tipo: p.tipoCacao, Calidad: p.calidad,
            Cantidad_kg: p.cantidad, PrecioKg: p.precioKg, Total: p.total
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'OrdenesCompra');
        XLSX.writeFile(wb, 'OrdenesCompra_CacaoFlow.xlsx');
        UI.toast('Excel descargado', 'success');
    }
};
