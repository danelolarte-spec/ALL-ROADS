/* ================================================================
   pdf.js — Generación de PDFs profesionales con jsPDF
================================================================ */

const PDFGen = {

    _doc(orientation = 'p') {
        const { jsPDF } = window.jspdf;
        return new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    },

    _palette: {
        cacao: [92, 58, 30],
        verde: [59, 122, 72],
        beige: [245, 236, 217],
        gris: [107, 114, 128],
        claro: [243, 226, 195]
    },

    // ---- Encabezado corporativo ----
    _header(doc, titulo, subtitulo = '') {
        const config = Storage.get(Storage.KEYS.config, {});
        const empresa = config.empresa || {};
        const w = doc.internal.pageSize.getWidth();

        // Banda superior
        doc.setFillColor(...this._palette.cacao);
        doc.rect(0, 0, w, 22, 'F');

        // "Logo" textual estilo Smart Cacao
        doc.setTextColor(174, 216, 179); // verde claro
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('smart', 12, 11);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('CACAO', 27, 13);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Sistema de Gestión de Cacao', 12, 18);

        // Datos empresa a la derecha
        doc.setFontSize(8);
        const rightX = w - 12;
        doc.text(empresa.nombre || 'Smart Cacao Arauquita', rightX, 8, { align: 'right' });
        doc.text('NIT: ' + (empresa.nit || ''), rightX, 12, { align: 'right' });
        doc.text(empresa.direccion || '', rightX, 16, { align: 'right' });
        doc.text(empresa.telefono || '', rightX, 20, { align: 'right' });

        // Banda verde con título
        doc.setFillColor(...this._palette.verde);
        doc.rect(0, 22, w, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(titulo, 12, 30);
        if (subtitulo) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(subtitulo, rightX, 30, { align: 'right' });
        }

        doc.setTextColor(0, 0, 0);
        return 42; // Posición Y donde comienza el contenido
    },

    // ---- Pie de página ----
    _footer(doc) {
        const w = doc.internal.pageSize.getWidth();
        const h = doc.internal.pageSize.getHeight();
        doc.setDrawColor(...this._palette.cacao);
        doc.setLineWidth(0.5);
        doc.line(12, h - 16, w - 12, h - 16);

        doc.setFontSize(8);
        doc.setTextColor(...this._palette.gris);
        doc.text('Documento generado por Smart Cacao • ' + Helpers.formatDateTime(Helpers.now()), 12, h - 10);
        const pages = doc.internal.getNumberOfPages();
        doc.text(`Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pages}`, w - 12, h - 10, { align: 'right' });
    },

    _addFooters(doc) {
        const total = doc.internal.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
            doc.setPage(i);
            this._footer(doc);
        }
    },

    // ===========================================================
    //  ORDEN DE SERVICIO
    // ===========================================================
    ordenServicio(orden) {
        const finca = Storage.findById(Storage.KEYS.fincas, orden.fincaId) || {};
        const doc = this._doc();
        let y = this._header(doc, 'ORDEN DE SERVICIO', orden.numero);

        // Datos generales
        doc.autoTable({
            startY: y + 4,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: this._palette.cacao, textColor: 255 },
            head: [['DATOS DE LA ORDEN', '']],
            body: [
                ['Número', orden.numero],
                ['Fecha de la orden', Helpers.formatDate(orden.fecha)],
                ['Estado', orden.estado.toUpperCase()],
                ['Tipo de cacao', orden.tipoCacao],
                ['Cantidad a recolectar', Helpers.formatKg(orden.cantidad)],
                ['Calidad', orden.calidad],
                ['Clones', (orden.clones || []).join(', ')],
                ['Confirmada día anterior', orden.confirmadaDiaAnterior ? 'SÍ' : 'NO'],
                ['Observaciones', orden.observaciones || '-']
            ]
        });

        // Datos finca
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 6,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: this._palette.verde, textColor: 255 },
            head: [['DATOS DE LA FINCA', '']],
            body: [
                ['Finca', finca.nombre || '-'],
                ['Propietario', finca.propietario || '-'],
                ['Cédula', finca.cedula || '-'],
                ['Teléfono', finca.telefono || '-'],
                ['Ubicación', `${finca.vereda || ''}, ${finca.municipio || ''}, ${finca.departamento || ''}`],
                ['Coordenadas', `${finca.lat}, ${finca.lng}`],
                ['Área sembrada', (finca.areaSembrada || 0) + ' ha'],
                ['Hectáreas productivas', (finca.hectareasProductivas || 0) + ' ha']
            ]
        });

        // Firma
        const fy = doc.lastAutoTable.finalY + 30;
        doc.line(20, fy, 80, fy);
        doc.line(120, fy, 180, fy);
        doc.setFontSize(9);
        doc.text('Firma productor', 50, fy + 5, { align: 'center' });
        doc.text('Firma responsable', 150, fy + 5, { align: 'center' });

        this._addFooters(doc);
        doc.save(`Orden_${orden.numero}.pdf`);
    },

    // ===========================================================
    //  NOTA DE RECOLECCIÓN
    // ===========================================================
    notaRecoleccion(nota) {
        const orden = Storage.findById(Storage.KEYS.ordenes, nota.ordenId) || {};
        const finca = Storage.findById(Storage.KEYS.fincas, nota.fincaId) || {};
        const doc = this._doc();
        let y = this._header(doc, 'NOTA DE RECOLECCIÓN', nota.numero);

        doc.autoTable({
            startY: y + 4,
            theme: 'striped',
            headStyles: { fillColor: this._palette.verde, textColor: 255 },
            head: [['CONCEPTO', 'VALOR']],
            body: [
                ['Número Nota', nota.numero],
                ['Orden asociada', orden.numero || '-'],
                ['Fecha real de recolección', Helpers.formatDate(nota.fechaReal)],
                ['Finca', finca.nombre || '-'],
                ['Propietario', finca.propietario || '-'],
                ['Cédula', finca.cedula || '-'],
                ['Tipo de cacao', nota.tipoCacao],
                ['Cantidad PROGRAMADA', Helpers.formatKg(nota.cantidadProgramada || orden.cantidad)],
                ['Cantidad REAL recolectada', Helpers.formatKg(nota.pesoReal)],
                ['Calidad real', nota.calidadReal],
                ['Clones recolectados', (nota.clones || []).join(', ')],
                ['Responsable', nota.responsable || '-'],
                ['Observaciones finales', nota.observaciones || '-']
            ]
        });

        // Historial de cambios
        if (nota.historial && nota.historial.length > 0) {
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 6,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: this._palette.cacao, textColor: 255 },
                head: [['Fecha', 'Cambio', 'Detalle']],
                body: nota.historial.map(h => [Helpers.formatDateTime(h.fecha), h.tipo, h.detalle])
            });
        }

        // Firmas
        const fy = doc.lastAutoTable.finalY + 25;
        doc.line(20, fy, 80, fy);
        doc.line(120, fy, 180, fy);
        doc.setFontSize(9);
        doc.text('Firma productor', 50, fy + 5, { align: 'center' });
        doc.text('Firma recolector', 150, fy + 5, { align: 'center' });

        this._addFooters(doc);
        doc.save(`Nota_${nota.numero}.pdf`);
    },

    // ===========================================================
    //  ORDEN DE COMPRA
    // ===========================================================
    ordenCompra(oc) {
        const finca = Storage.findById(Storage.KEYS.fincas, oc.fincaId) || {};
        const config = Storage.get(Storage.KEYS.config, {});
        const empresa = config.empresa || {};
        const doc = this._doc();
        let y = this._header(doc, 'ORDEN DE COMPRA', oc.numero);

        // Datos cabecera
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Datos del productor', 12, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`${finca.propietario || ''}`, 12, y + 10);
        doc.text(`CC: ${finca.cedula || ''}`, 12, y + 15);
        doc.text(`Tel: ${finca.telefono || ''}`, 12, y + 20);
        doc.text(`${finca.vereda || ''}, ${finca.municipio || ''}`, 12, y + 25);

        doc.setFont('helvetica', 'bold');
        doc.text('Datos de la finca', 110, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.text(`${finca.nombre || ''}`, 110, y + 10);
        doc.text(`Departamento: ${finca.departamento || ''}`, 110, y + 15);
        doc.text(`Municipio: ${finca.municipio || ''}`, 110, y + 20);
        doc.text(`Fecha: ${Helpers.formatDate(oc.fecha)}`, 110, y + 25);

        // Tabla detalle
        doc.autoTable({
            startY: y + 32,
            theme: 'grid',
            headStyles: { fillColor: this._palette.cacao, textColor: 255, fontStyle: 'bold' },
            head: [['Concepto', 'Tipo', 'Calidad', 'Cantidad (kg)', 'Precio/kg', 'Subtotal']],
            body: [[
                'Compra de cacao',
                oc.tipoCacao,
                oc.calidad,
                Helpers.formatNumber(oc.cantidad),
                Helpers.formatCOP(oc.precioKg),
                Helpers.formatCOP(oc.total)
            ]]
        });

        // Totales
        const ty = doc.lastAutoTable.finalY + 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', 130, ty);
        doc.text(Helpers.formatCOP(oc.total), 195, ty, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setFillColor(...this._palette.verde);
        doc.rect(125, ty + 5, 75, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL A PAGAR', 130, ty + 13);
        doc.text(Helpers.formatCOP(oc.total), 198, ty + 13, { align: 'right' });
        doc.setTextColor(0, 0, 0);

        // Firmas
        const fy = ty + 40;
        doc.line(20, fy, 80, fy);
        doc.line(120, fy, 180, fy);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Recibí conforme - Productor', 50, fy + 5, { align: 'center' });
        doc.text('Comprador - ' + (empresa.nombre || 'Smart Cacao'), 150, fy + 5, { align: 'center' });

        this._addFooters(doc);
        doc.save(`OrdenCompra_${oc.numero}.pdf`);
    },

    // Alias para compatibilidad
    prefactura(p) { return this.ordenCompra(p); },

    // ===========================================================
    //  HISTÓRICO POR FINCA
    // ===========================================================
    historicoFinca(finca, stats, notas) {
        const doc = this._doc();
        let y = this._header(doc, 'HISTÓRICO DE FINCA', finca.nombre);

        doc.autoTable({
            startY: y + 4,
            theme: 'grid',
            headStyles: { fillColor: this._palette.verde, textColor: 255 },
            head: [['Datos generales', '']],
            body: [
                ['Finca', finca.nombre],
                ['Propietario', finca.propietario],
                ['Cédula', finca.cedula],
                ['Ubicación', `${finca.vereda}, ${finca.municipio}, ${finca.departamento}`],
                ['Coordenadas', `${finca.lat}, ${finca.lng}`],
                ['Área sembrada', finca.areaSembrada + ' ha'],
                ['Hectáreas productivas', finca.hectareasProductivas + ' ha'],
                ['Clones', (finca.clones || []).join(', ')]
            ]
        });

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 6,
            theme: 'striped',
            headStyles: { fillColor: this._palette.cacao, textColor: 255 },
            head: [['Indicador', 'Valor']],
            body: [
                ['Total histórico recolectado', Helpers.formatKg(stats.totalKg)],
                ['Total recolecciones', stats.totalRecolecciones],
                ['Calidad promedio', stats.calidadPromedio],
                ['Promedio por recolección', Helpers.formatKg(stats.promedio)],
                ['Última recolección', stats.ultimaFecha ? Helpers.formatDate(stats.ultimaFecha) : '-']
            ]
        });

        // Detalle de recolecciones
        if (notas && notas.length > 0) {
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 6,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: this._palette.cacao, textColor: 255 },
                head: [['Fecha', 'Nota', 'Tipo', 'Calidad', 'Peso (kg)']],
                body: notas.map(n => [
                    Helpers.formatDate(n.fechaReal),
                    n.numero,
                    n.tipoCacao,
                    n.calidadReal,
                    Helpers.formatNumber(n.pesoReal)
                ])
            });
        }

        this._addFooters(doc);
        doc.save(`Historico_${Helpers.slug(finca.nombre)}.pdf`);
    },

    // ===========================================================
    //  CRONOGRAMA DE RUTAS
    // ===========================================================
    cronogramaRuta(ruta) {
        const doc = this._doc('l'); // landscape
        let y = this._header(doc, 'CRONOGRAMA DE RUTA', `Fecha: ${Helpers.formatDate(ruta.fecha)}`);

        const vehiculo = Storage.findById(Storage.KEYS.vehiculos, ruta.vehiculoId);

        doc.autoTable({
            startY: y + 4,
            theme: 'grid',
            headStyles: { fillColor: this._palette.verde, textColor: 255 },
            head: [['Información de la ruta', '']],
            body: [
                ['Identificador', ruta.numero || ruta.id],
                ['Fecha', Helpers.formatDate(ruta.fecha)],
                ['Vehículo', vehiculo ? `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}` : '-'],
                ['Capacidad vehículo', vehiculo ? Helpers.formatKg(vehiculo.capacidad) : '-'],
                ['Total fincas', ruta.stops.length],
                ['Distancia total', ruta.totalKm.toFixed(2) + ' km'],
                ['Tiempo estimado', ruta.tiempoEstimadoMin + ' min'],
                ['Total cacao a recolectar', Helpers.formatKg(ruta.totalKg)],
                ['Uso capacidad', ((ruta.totalKg / (vehiculo?.capacidad || 1)) * 100).toFixed(1) + ' %']
            ]
        });

        // Detalle paradas
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 6,
            theme: 'striped',
            headStyles: { fillColor: this._palette.cacao, textColor: 255 },
            head: [['#', 'Hora', 'Finca', 'Propietario', 'Vereda', 'Cantidad (kg)', 'Tipo', 'Calidad', 'Distancia (km)']],
            body: ruta.stops.map((s, i) => [
                i + 1,
                s.horaEstimada || '-',
                s.fincaNombre,
                s.propietario,
                s.vereda,
                Helpers.formatNumber(s.cantidad),
                s.tipoCacao,
                s.calidad,
                s.distance.toFixed(2)
            ])
        });

        this._addFooters(doc);
        doc.save(`Ruta_${ruta.numero || ruta.id}.pdf`);
    }
};
