/* ================================================================
   mock.js — Datos simulados (Arauquita, Arauca)
================================================================ */

const MockData = (() => {

    // Coordenadas aproximadas de Arauquita y veredas circundantes
    // El Troncal: ~7.0292, -71.4475

    const clones = [
        { id: 'cl_ccn51', nombre: 'CCN-51', descripcion: 'Clon ecuatoriano de alto rendimiento', custom: false },
        { id: 'cl_tcs01', nombre: 'TCS-01', descripcion: 'Tropical Colombian Selection 01', custom: false },
        { id: 'cl_tcs13', nombre: 'TCS-13', descripcion: 'Tropical Colombian Selection 13', custom: false },
        { id: 'cl_ics95', nombre: 'ICS-95', descripcion: 'Imperial College Selection 95', custom: false },
        { id: 'cl_pr5',   nombre: 'PR-5',   descripcion: 'Pound Resistant 5', custom: false },
        { id: 'cl_psa13', nombre: 'PSA-13', descripcion: 'Pichilingue SA 13', custom: false }
    ];

    const fincas = [
        {
            id: 'finca_001', codigo: 'FIN-001',
            nombre: 'Hacienda La Esperanza',
            lat: 7.0421, lng: -71.4321,
            departamento: 'Arauca', municipio: 'Arauquita', vereda: 'El Troncal',
            propietario: 'Carlos Mendoza Quintero', cedula: '17.658.234', telefono: '+57 320 432 5601',
            areaSembrada: 12.5, hectareasProductivas: 10.0,
            clones: ['CCN-51', 'TCS-01', 'ICS-95'],
            poligonoTotal: [
                [7.0431, -71.4335], [7.0431, -71.4307],
                [7.0411, -71.4307], [7.0411, -71.4335]
            ],
            poligonoSembrado: [
                [7.0425, -71.4329], [7.0425, -71.4313],
                [7.0417, -71.4313], [7.0417, -71.4329]
            ],
            createdAt: '2025-01-15T10:00:00Z'
        },
        {
            id: 'finca_002', codigo: 'FIN-002',
            nombre: 'Finca El Recuerdo',
            lat: 7.0588, lng: -71.4612,
            departamento: 'Arauca', municipio: 'Arauquita', vereda: 'La Pesquera',
            propietario: 'María Elena Rojas Pérez', cedula: '26.789.123', telefono: '+57 312 567 8932',
            areaSembrada: 8.0, hectareasProductivas: 7.2,
            clones: ['CCN-51', 'TCS-13'],
            poligonoTotal: [
                [7.0596, -71.4622], [7.0598, -71.4602],
                [7.0580, -71.4600], [7.0578, -71.4620]
            ],
            poligonoSembrado: [
                [7.0593, -71.4618], [7.0594, -71.4606],
                [7.0583, -71.4605], [7.0582, -71.4617]
            ],
            createdAt: '2025-02-20T10:00:00Z'
        },
        {
            id: 'finca_003', codigo: 'FIN-003',
            nombre: 'Predio Los Mangos',
            lat: 7.0152, lng: -71.4189,
            departamento: 'Arauca', municipio: 'Arauquita', vereda: 'Brisas del Carare',
            propietario: 'José Alberto Rivera López', cedula: '15.234.876', telefono: '+57 314 678 1234',
            areaSembrada: 15.0, hectareasProductivas: 13.5,
            clones: ['CCN-51', 'ICS-95', 'PR-5'],
            poligonoTotal: [
                [7.0165, -71.4205], [7.0168, -71.4175],
                [7.0140, -71.4172], [7.0138, -71.4203]
            ],
            poligonoSembrado: [
                [7.0160, -71.4198], [7.0163, -71.4180],
                [7.0145, -71.4179], [7.0143, -71.4197]
            ],
            createdAt: '2024-11-08T10:00:00Z'
        },
        {
            id: 'finca_004', codigo: 'FIN-004',
            nombre: 'Finca San Antonio',
            lat: 7.0721, lng: -71.4087,
            departamento: 'Arauca', municipio: 'Arauquita', vereda: 'Aguas Claras',
            propietario: 'Luis Fernando Martínez', cedula: '88.234.567', telefono: '+57 318 789 4321',
            areaSembrada: 6.5, hectareasProductivas: 5.8,
            clones: ['TCS-01', 'TCS-13', 'PSA-13'],
            createdAt: '2025-03-12T10:00:00Z'
        },
        {
            id: 'finca_005', codigo: 'FIN-005',
            nombre: 'Cacao del Llano',
            lat: 7.0089, lng: -71.4798,
            departamento: 'Arauca', municipio: 'Arauquita', vereda: 'Caño Limón',
            propietario: 'Ana Lucía Torres Vargas', cedula: '52.987.654', telefono: '+57 315 234 5678',
            areaSembrada: 20.0, hectareasProductivas: 18.5,
            clones: ['CCN-51', 'ICS-95'],
            createdAt: '2024-08-22T10:00:00Z'
        },
        {
            id: 'finca_006', codigo: 'FIN-006',
            nombre: 'Finca Buenos Aires',
            lat: 7.0834, lng: -71.4521,
            departamento: 'Arauca', municipio: 'Arauquita', vereda: 'Buenos Aires',
            propietario: 'Pedro Antonio Suárez', cedula: '17.567.890', telefono: '+57 319 543 2109',
            areaSembrada: 9.8, hectareasProductivas: 8.5,
            clones: ['TCS-01', 'PR-5'],
            createdAt: '2025-04-05T10:00:00Z'
        },
        {
            id: 'finca_007', codigo: 'FIN-007',
            nombre: 'El Paraíso del Cacao',
            lat: 7.0312, lng: -71.4912,
            departamento: 'Arauca', municipio: 'Arauquita', vereda: 'Panamá de Arauca',
            propietario: 'Rosa Inés Castaño', cedula: '40.876.543', telefono: '+57 316 432 1098',
            areaSembrada: 11.2, hectareasProductivas: 10.0,
            clones: ['CCN-51', 'TCS-13', 'PSA-13'],
            createdAt: '2024-12-18T10:00:00Z'
        },
        {
            id: 'finca_008', codigo: 'FIN-008',
            nombre: 'Hacienda La Frontera',
            lat: 7.0567, lng: -71.4087,
            departamento: 'Arauca', municipio: 'Arauquita', vereda: 'La Frontera',
            propietario: 'Jorge Hernán Vargas Cruz', cedula: '79.345.678', telefono: '+57 313 765 4321',
            areaSembrada: 14.5, hectareasProductivas: 12.8,
            clones: ['CCN-51', 'ICS-95', 'PR-5', 'TCS-01'],
            createdAt: '2024-09-30T10:00:00Z'
        }
    ];

    const vehiculos = [
        {
            id: 'veh_001', placa: 'WJK-471', marca: 'Chevrolet', modelo: 'NPR 2022',
            propietario: 'Transportes El Troncal SAS', capacidad: 3500,
            soatNumero: 'SOAT-202503-001', soatVence: '2026-08-15',
            tecnoNumero: 'TEC-2025-441', tecnoVence: '2026-06-10'
        },
        {
            id: 'veh_002', placa: 'BCD-892', marca: 'Hino', modelo: 'Dutro 2021',
            propietario: 'Logística Arauca SAS', capacidad: 5000,
            soatNumero: 'SOAT-202504-022', soatVence: '2026-06-04',
            tecnoNumero: 'TEC-2025-678', tecnoVence: '2025-12-15'
        },
        {
            id: 'veh_003', placa: 'XYZ-555', marca: 'Ford', modelo: 'Cargo 1723',
            propietario: 'Pedro Antonio Suárez', capacidad: 8000,
            soatNumero: 'SOAT-202506-099', soatVence: '2025-06-01',
            tecnoNumero: 'TEC-2024-321', tecnoVence: '2025-07-20'
        },
        {
            id: 'veh_004', placa: 'MNO-123', marca: 'Mitsubishi', modelo: 'Canter 2023',
            propietario: 'Transportes El Troncal SAS', capacidad: 2500,
            soatNumero: 'SOAT-202509-044', soatVence: '2026-09-20',
            tecnoNumero: 'TEC-2025-512', tecnoVence: '2026-10-05'
        }
    ];

    // Fechas próximas para órdenes
    const today = new Date();
    const fmt = (d) => d.toISOString().slice(0, 10);
    const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

    const ordenes = [
        {
            id: 'ord_001', numero: 'OS-2026-0001',
            fecha: addDays(0), fincaId: 'finca_001',
            tipoCacao: 'Seco', cantidad: 850, clones: ['CCN-51', 'ICS-95'],
            calidad: 'Premium', observaciones: 'Recolección programada temprana',
            estado: 'Confirmada', confirmadaDiaAnterior: true, confirmadaLlamada: true,
            createdAt: addDays(-2)
        },
        {
            id: 'ord_002', numero: 'OS-2026-0002',
            fecha: addDays(0), fincaId: 'finca_002',
            tipoCacao: 'Seco', cantidad: 620, clones: ['CCN-51', 'TCS-13'],
            calidad: 'Estándar', observaciones: '',
            estado: 'Confirmada', confirmadaDiaAnterior: true, confirmadaLlamada: true,
            createdAt: addDays(-2)
        },
        {
            id: 'ord_003', numero: 'OS-2026-0003',
            fecha: addDays(0), fincaId: 'finca_004',
            tipoCacao: 'En baba', cantidad: 1200, clones: ['TCS-01', 'PSA-13'],
            calidad: 'Premium', observaciones: 'Verificar humedad',
            estado: 'Pendiente', confirmadaDiaAnterior: false, confirmadaLlamada: false,
            createdAt: addDays(-1)
        },
        {
            id: 'ord_004', numero: 'OS-2026-0004',
            fecha: addDays(1), fincaId: 'finca_005',
            tipoCacao: 'Seco', cantidad: 1500, clones: ['CCN-51', 'ICS-95'],
            calidad: 'Excelencia', observaciones: 'Lote especial para exportación',
            estado: 'Confirmada', confirmadaDiaAnterior: false, confirmadaLlamada: true,
            createdAt: addDays(-1)
        },
        {
            id: 'ord_005', numero: 'OS-2026-0005',
            fecha: addDays(1), fincaId: 'finca_006',
            tipoCacao: 'En baba', cantidad: 480, clones: ['TCS-01', 'PR-5'],
            calidad: 'Estándar', observaciones: '',
            estado: 'Pendiente', confirmadaDiaAnterior: false, confirmadaLlamada: false,
            createdAt: addDays(0)
        },
        {
            id: 'ord_006', numero: 'OS-2026-0006',
            fecha: addDays(2), fincaId: 'finca_008',
            tipoCacao: 'Seco', cantidad: 980, clones: ['CCN-51', 'PR-5'],
            calidad: 'Premium', observaciones: '',
            estado: 'Pendiente', confirmadaDiaAnterior: false, confirmadaLlamada: false,
            createdAt: addDays(0)
        },
        {
            id: 'ord_007', numero: 'OS-2026-0007',
            fecha: addDays(-7), fincaId: 'finca_003',
            tipoCacao: 'Seco', cantidad: 1100, clones: ['CCN-51', 'PR-5'],
            calidad: 'Premium', observaciones: '',
            estado: 'Finalizada', confirmadaDiaAnterior: true, confirmadaLlamada: true,
            createdAt: addDays(-10)
        },
        {
            id: 'ord_008', numero: 'OS-2026-0008',
            fecha: addDays(-15), fincaId: 'finca_007',
            tipoCacao: 'En baba', cantidad: 720, clones: ['TCS-13', 'PSA-13'],
            calidad: 'Estándar', observaciones: '',
            estado: 'Finalizada', confirmadaDiaAnterior: true, confirmadaLlamada: true,
            createdAt: addDays(-20)
        }
    ];

    // Notas históricas (de las órdenes finalizadas)
    const notas = [
        {
            id: 'nota_001', numero: 'NR-2026-0001', ordenId: 'ord_007',
            fincaId: 'finca_003', fechaReal: addDays(-7),
            tipoCacao: 'Seco', cantidadProgramada: 1100, pesoReal: 1085,
            calidadReal: 'Premium', clones: ['CCN-51', 'PR-5'],
            responsable: 'Juan Pérez', observaciones: 'Recolección sin novedades',
            historial: [
                { fecha: addDays(-7), tipo: 'CREACIÓN', detalle: 'Nota creada desde orden OS-2026-0007' }
            ],
            createdAt: addDays(-7)
        },
        {
            id: 'nota_002', numero: 'NR-2026-0002', ordenId: 'ord_008',
            fincaId: 'finca_007', fechaReal: addDays(-15),
            tipoCacao: 'En baba', cantidadProgramada: 720, pesoReal: 745,
            calidadReal: 'Estándar', clones: ['TCS-13', 'PSA-13'],
            responsable: 'María Gómez', observaciones: 'Peso superior al programado',
            historial: [
                { fecha: addDays(-15), tipo: 'CREACIÓN', detalle: 'Nota creada desde orden OS-2026-0008' }
            ],
            createdAt: addDays(-15)
        }
    ];

    // Prefacturas asociadas
    const prefacturas = [
        {
            id: 'pre_001', numero: 'OC-2026-0001', notaId: 'nota_001', fincaId: 'finca_003',
            fecha: addDays(-7), tipoCacao: 'Seco', cantidad: 1085,
            calidad: 'Premium', precioKg: 11500, total: 1085 * 11500, estado: 'Generada'
        },
        {
            id: 'pre_002', numero: 'OC-2026-0002', notaId: 'nota_002', fincaId: 'finca_007',
            fecha: addDays(-15), tipoCacao: 'En baba', cantidad: 745,
            calidad: 'Estándar', precioKg: 4500, total: 745 * 4500, estado: 'Generada'
        }
    ];

    // ===================== USUARIOS DEMO =====================
    const usuarios = [
        'Administrador',
        'Juan Pérez (Coord. operaciones)',
        'María Gómez (Recolector)',
        'Pedro Silva (Recolector)',
        'Carmen López (Asistente)'
    ];

    // ===================== HISTORIAL DE AUDITORÍA DEMO =====================
    // Ejemplo completo del flujo de la orden OS-2026-0007 → nota_001 → OC-2026-0001
    const ts = (daysAgo, h = 8, m = 0) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        d.setHours(h, m, 0, 0);
        return d.toISOString();
    };

    const auditLog = [
        // --- Flujo de la orden OS-2026-0007 (Finca: Predio Los Mangos) ---
        {
            id: 'log_001', timestamp: ts(10, 9, 15),
            user: 'Administrador',
            entityType: 'orden', entityId: 'ord_007', entityNumero: 'OS-2026-0007',
            action: 'crear',
            details: 'Orden creada para la finca Predio Los Mangos · 1100 kg de cacao Seco Premium',
            changes: []
        },
        {
            id: 'log_002', timestamp: ts(9, 14, 30),
            user: 'Juan Pérez (Coord. operaciones)',
            entityType: 'orden', entityId: 'ord_007', entityNumero: 'OS-2026-0007',
            action: 'editar',
            details: 'Ajuste de cantidad por verificación con el productor',
            changes: [
                { field: 'cantidad', before: 1000, after: 1100 },
                { field: 'observaciones', before: '', after: 'Productor confirma 1100 kg disponibles' }
            ]
        },
        {
            id: 'log_003', timestamp: ts(8, 17, 45),
            user: 'Juan Pérez (Coord. operaciones)',
            entityType: 'orden', entityId: 'ord_007', entityNumero: 'OS-2026-0007',
            action: 'confirmar',
            details: 'Confirmación telefónica con el productor José Alberto Rivera',
            changes: [{ field: 'confirmadaLlamada', before: false, after: true }]
        },
        {
            id: 'log_004', timestamp: ts(8, 18, 10),
            user: 'Juan Pérez (Coord. operaciones)',
            entityType: 'orden', entityId: 'ord_007', entityNumero: 'OS-2026-0007',
            action: 'estado',
            details: 'Estado: Pendiente → Confirmada',
            changes: [{ field: 'estado', before: 'Pendiente', after: 'Confirmada' }]
        },
        {
            id: 'log_005', timestamp: ts(7, 6, 0),
            user: 'Administrador',
            entityType: 'ruta', entityId: 'rt_demo_001', entityNumero: 'RT-2026-001',
            action: 'crear',
            details: 'Ruta planificada con vehículo BCD-892 · 3 fincas · 1820 kg estimados',
            changes: []
        },
        {
            id: 'log_006', timestamp: ts(7, 6, 5),
            user: 'Administrador',
            entityType: 'orden', entityId: 'ord_007', entityNumero: 'OS-2026-0007',
            action: 'asignar_ruta',
            details: 'Asignada a ruta RT-2026-001 con vehículo BCD-892',
            changes: [{ field: 'estado', before: 'Confirmada', after: 'En ruta' }]
        },
        {
            id: 'log_007', timestamp: ts(7, 11, 20),
            user: 'María Gómez (Recolector)',
            entityType: 'nota', entityId: 'nota_001', entityNumero: 'NR-2026-0001',
            action: 'crear',
            details: 'Nota generada desde orden OS-2026-0007 al llegar a la finca',
            changes: [
                { field: 'pesoReal', before: null, after: 1085 },
                { field: 'calidadReal', before: null, after: 'Premium' }
            ]
        },
        {
            id: 'log_008', timestamp: ts(7, 11, 22),
            user: 'María Gómez (Recolector)',
            entityType: 'orden', entityId: 'ord_007', entityNumero: 'OS-2026-0007',
            action: 'estado',
            details: 'Estado: En ruta → Recolectada',
            changes: [{ field: 'estado', before: 'En ruta', after: 'Recolectada' }]
        },
        {
            id: 'log_009', timestamp: ts(7, 11, 23),
            user: 'María Gómez (Recolector)',
            entityType: 'prefactura', entityId: 'pre_001', entityNumero: 'OC-2026-0001',
            action: 'generar_oc',
            details: 'Orden de Compra generada automáticamente desde nota NR-2026-0001 · 1085 kg × $11.500 = $12.477.500',
            changes: []
        },
        {
            id: 'log_010', timestamp: ts(6, 9, 30),
            user: 'Carmen López (Asistente)',
            entityType: 'nota', entityId: 'nota_001', entityNumero: 'NR-2026-0001',
            action: 'editar',
            details: 'Corrección de observaciones tras verificación en bodega',
            changes: [
                { field: 'observaciones', before: '', after: 'Recolección sin novedades. Verificado en báscula central.' }
            ]
        },
        {
            id: 'log_011', timestamp: ts(5, 16, 0),
            user: 'Administrador',
            entityType: 'orden', entityId: 'ord_007', entityNumero: 'OS-2026-0007',
            action: 'estado',
            details: 'Estado: Recolectada → Finalizada (pago procesado)',
            changes: [{ field: 'estado', before: 'Recolectada', after: 'Finalizada' }]
        },

        // --- Flujo de la orden OS-2026-0008 ---
        {
            id: 'log_012', timestamp: ts(20, 8, 0),
            user: 'Administrador',
            entityType: 'orden', entityId: 'ord_008', entityNumero: 'OS-2026-0008',
            action: 'crear',
            details: 'Orden creada para la finca El Paraíso del Cacao · 720 kg en baba',
            changes: []
        },
        {
            id: 'log_013', timestamp: ts(15, 10, 15),
            user: 'Pedro Silva (Recolector)',
            entityType: 'nota', entityId: 'nota_002', entityNumero: 'NR-2026-0002',
            action: 'crear',
            details: 'Nota generada · Peso REAL 745 kg (superior al programado en +25 kg)',
            changes: [
                { field: 'pesoReal', before: null, after: 745 },
                { field: 'calidadReal', before: null, after: 'Estándar' }
            ]
        },
        {
            id: 'log_014', timestamp: ts(15, 10, 16),
            user: 'Pedro Silva (Recolector)',
            entityType: 'prefactura', entityId: 'pre_002', entityNumero: 'OC-2026-0002',
            action: 'generar_oc',
            details: 'Orden de Compra generada · 745 kg × $4.500 = $3.352.500',
            changes: []
        }
    ];

    return { clones, fincas, vehiculos, ordenes, notas, prefacturas, usuarios, auditLog };
})();
