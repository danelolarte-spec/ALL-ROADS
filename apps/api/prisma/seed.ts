import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Usuarios
  const pwdAdmin = await bcrypt.hash('Admin123!', 10);
  const pwdOp = await bcrypt.hash('Operaciones123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@allroads.co' },
    update: {},
    create: { email: 'admin@allroads.co', password: pwdAdmin, fullName: 'Admin ALL ROADS', role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'operaciones@allroads.co' },
    update: {},
    create: {
      email: 'operaciones@allroads.co',
      password: pwdOp,
      fullName: 'Operaciones',
      role: 'OPERACIONES',
    },
  });

  // Vehículos
  const v1 = await prisma.vehicle.upsert({
    where: { placa: 'ABC123' },
    update: {},
    create: {
      placa: 'ABC123',
      numeroInterno: 'INT-001',
      tipo: 'Sedán',
      marca: 'Toyota',
      linea: 'Corolla',
      modelo: 2023,
      capacidadPasajeros: 4,
      capacidadCarga: 0.4,
      estado: 'DISPONIBLE',
      kilometraje: 45000,
      empresaAfiliadora: 'ALL ROADS',
      soatVence: new Date('2026-12-15'),
      tecnomecanicaVence: new Date('2026-08-01'),
      tarjetaOperVence: new Date('2027-03-20'),
    },
  });
  const v2 = await prisma.vehicle.upsert({
    where: { placa: 'XYZ789' },
    update: {},
    create: {
      placa: 'XYZ789',
      numeroInterno: 'INT-002',
      tipo: 'Van',
      marca: 'Hyundai',
      linea: 'H1',
      modelo: 2022,
      capacidadPasajeros: 11,
      capacidadCarga: 1.2,
      estado: 'DISPONIBLE',
      kilometraje: 78000,
      empresaAfiliadora: 'ALL ROADS',
      soatVence: new Date('2026-06-10'),  // próximo a vencer
      tecnomecanicaVence: new Date('2026-05-20'), // crítico
      tarjetaOperVence: new Date('2027-02-15'),
    },
  });

  // Conductores
  const d1 = await prisma.driver.upsert({
    where: { documento: '1010101010' },
    update: {},
    create: {
      fullName: 'Carlos Rodríguez',
      documento: '1010101010',
      licencia: 'L-001',
      categoriaLicencia: 'C1',
      licenciaVence: new Date('2027-01-01'),
      direccion: 'Calle 80 # 50-25, Bogotá',
      residenciaLat: 4.6987,
      residenciaLng: -74.0857,
      telefono: '3001112233',
      contactoEmergencia: 'María Rodríguez 3009998877',
      estado: 'ACTIVO',
    },
  });
  const d2 = await prisma.driver.upsert({
    where: { documento: '2020202020' },
    update: {},
    create: {
      fullName: 'Andrés Pérez',
      documento: '2020202020',
      licencia: 'L-002',
      categoriaLicencia: 'C2',
      licenciaVence: new Date('2026-06-15'),
      direccion: 'Cra 50 # 100-10, Bogotá',
      residenciaLat: 4.6837,
      residenciaLng: -74.0567,
      telefono: '3014445566',
      estado: 'ACTIVO',
    },
  });

  // Asignaciones
  await prisma.vehicleAssignment.deleteMany();
  await prisma.vehicleAssignment.create({
    data: { vehicleId: v1.id, driverId: d1.id, type: 'FIJA', active: true },
  });
  await prisma.vehicleAssignment.create({
    data: { vehicleId: v2.id, driverId: d2.id, type: 'FIJA', active: true },
  });

  // Documentos de conductor (RRHH)
  await prisma.document.create({
    data: {
      type: 'EPS',
      name: 'EPS Sura',
      driverId: d1.id,
      issuedAt: new Date('2024-01-01'),
      expiresAt: new Date('2026-12-31'),
    },
  });
  await prisma.document.create({
    data: {
      type: 'CONTRATO',
      name: 'Contrato laboral',
      driverId: d1.id,
      issuedAt: new Date('2024-01-15'),
    },
  });

  // Contrato dinámico
  const contract = await prisma.contract.upsert({
    where: { id: 'seed-contract-1' },
    update: {},
    create: {
      id: 'seed-contract-1',
      name: 'Servicios Corporativos Empresa X',
      cliente: 'Empresa X S.A.',
      description: 'Transporte ejecutivo con campos personalizados',
      active: true,
      fields: {
        create: [
          { key: 'centroDeCosto', label: 'Centro de costo', type: 'TEXT', required: true, order: 0 },
          { key: 'autorizadoPor', label: 'Autorizado por', type: 'TEXT', required: true, order: 1 },
          { key: 'tipoViaje', label: 'Tipo de viaje', type: 'SELECT', options: JSON.stringify(['Ejecutivo', 'Aeropuerto', 'Evento']), required: true, order: 2 },
          { key: 'horaRegreso', label: 'Hora regreso (opcional)', type: 'TIME', required: false, order: 3 },
        ],
      },
    },
  });

  // Productos / Tarifas
  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: [
      { contractId: contract.id, code: 'BASE-EJ', name: 'Ruta base ejecutiva', unitPrice: 80000, cost: 25000 },
      { contractId: contract.id, code: 'HORA-ADIC', name: 'Hora adicional', unitPrice: 25000, cost: 8000 },
      { contractId: contract.id, code: 'ESPERA', name: 'Espera (30 min)', unitPrice: 15000, cost: 4000 },
      { contractId: contract.id, code: 'PEAJE', name: 'Peaje', unitPrice: 12000, cost: 12000 },
      { contractId: contract.id, code: 'REC-NOCT', name: 'Recargo nocturno', unitPrice: 18000, cost: 5000 },
      { contractId: contract.id, code: 'REC-FEST', name: 'Recargo festivo', unitPrice: 22000, cost: 6000 },
    ],
  });

  const base = await prisma.product.findUnique({ where: { code: 'BASE-EJ' } });

  // Servicios de ejemplo
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  const tomorrow = new Date(today.getTime() + 86400000);

  await prisma.service.deleteMany();
  await prisma.service.create({
    data: {
      contractId: contract.id,
      cliente: 'Empresa X S.A.',
      fecha: tomorrow,
      hora: '08:00',
      pasajeros: 2,
      origen: 'Calle 100 # 19-50, Bogotá',
      origenLat: 4.687,
      origenLng: -74.046,
      destino: 'Aeropuerto El Dorado',
      destinoLat: 4.7016,
      destinoLng: -74.1469,
      tipoVehiculo: 'Sedán',
      status: 'PENDIENTE',
      valorTotal: 80000,
      costoTotal: 25000,
      dynamicData: JSON.stringify({
        centroDeCosto: 'CC-001',
        autorizadoPor: 'Pedro Páramo',
        tipoViaje: 'Aeropuerto',
      }),
      items: {
        create: [{ productId: base!.id, quantity: 1, unitPrice: 80000, cost: 25000, total: 80000 }],
      },
    },
  });

  await prisma.service.create({
    data: {
      contractId: contract.id,
      cliente: 'Empresa X S.A.',
      fecha: today,
      hora: '14:00',
      pasajeros: 8,
      origen: 'Hotel Tequendama, Bogotá',
      destino: 'Centro Internacional, Bogotá',
      tipoVehiculo: 'Van',
      status: 'ASIGNADO',
      vehicleId: v2.id,
      driverId: d2.id,
      valorTotal: 95000,
      costoTotal: 30000,
      items: {
        create: [{ productId: base!.id, quantity: 1, unitPrice: 80000, cost: 25000, total: 80000 }],
      },
    },
  });

  await prisma.service.create({
    data: {
      contractId: contract.id,
      cliente: 'Empresa X S.A.',
      fecha: yesterday,
      hora: '09:30',
      pasajeros: 3,
      origen: 'Edificio Bavaria',
      destino: 'Aeropuerto El Dorado',
      tipoVehiculo: 'Sedán',
      status: 'COMPLETADO',
      vehicleId: v1.id,
      driverId: d1.id,
      valorTotal: 80000,
      costoTotal: 25000,
      items: {
        create: [{ productId: base!.id, quantity: 1, unitPrice: 80000, cost: 25000, total: 80000 }],
      },
    },
  });

  // Mantenimientos
  await prisma.maintenance.deleteMany();
  await prisma.maintenance.create({
    data: {
      vehicleId: v1.id,
      type: 'CAMBIO_ACEITE',
      description: 'Cambio aceite + filtros',
      taller: 'Toyota Premium',
      cost: 350000,
      kilometraje: 45000,
      nextDate: new Date(today.getTime() + 60 * 86400000),
      nextKilometraje: 50000,
    },
  });

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
