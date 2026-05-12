import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { AssignServiceDto, CreateServiceDto, UpdateServiceDto, ServiceItemDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(query?: { status?: string; from?: string; to?: string }) {
    return this.prisma.service.findMany({
      where: {
        ...(query?.status ? { status: query.status as any } : {}),
        ...(query?.from || query?.to
          ? {
              fecha: {
                ...(query?.from ? { gte: new Date(query.from) } : {}),
                ...(query?.to ? { lte: new Date(query.to) } : {}),
              },
            }
          : {}),
      },
      include: { contract: true, vehicle: true, driver: true, items: { include: { product: true } } },
      orderBy: { fecha: 'desc' },
    });
  }

  async get(id: string) {
    const s = await this.prisma.service.findUnique({
      where: { id },
      include: {
        contract: { include: { fields: true } },
        vehicle: true,
        driver: true,
        items: { include: { product: true } },
      },
    });
    if (!s) throw new NotFoundException('Servicio no encontrado');
    return { ...s, dynamicData: s.dynamicData ? JSON.parse(s.dynamicData) : {} };
  }

  async create(dto: CreateServiceDto, userId?: string) {
    const totals = this.computeTotals(dto.items || []);
    const s = await this.prisma.service.create({
      data: {
        contractId: dto.contractId,
        cliente: dto.cliente,
        fecha: new Date(dto.fecha),
        hora: dto.hora,
        pasajeros: dto.pasajeros ?? 1,
        origen: dto.origen,
        origenLat: dto.origenLat,
        origenLng: dto.origenLng,
        destino: dto.destino,
        destinoLat: dto.destinoLat,
        destinoLng: dto.destinoLng,
        parada1: dto.parada1,
        parada2: dto.parada2,
        parada3: dto.parada3,
        tipoVehiculo: dto.tipoVehiculo,
        observaciones: dto.observaciones,
        dynamicData: dto.dynamicData ? JSON.stringify(dto.dynamicData) : null,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        status: dto.vehicleId && dto.driverId ? 'ASIGNADO' : 'PENDIENTE',
        valorTotal: totals.valor,
        costoTotal: totals.costo,
        items: { create: dto.items?.map((it) => this.parseItem(it)) || [] },
      },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'CREATE', entity: 'Service', entityId: s.id, data: dto });
    return s;
  }

  async update(id: string, dto: UpdateServiceDto, userId?: string) {
    const totals = this.computeTotals(dto.items || []);
    // Recreate items if provided
    if (dto.items) {
      await this.prisma.serviceItem.deleteMany({ where: { serviceId: id } });
    }
    const s = await this.prisma.service.update({
      where: { id },
      data: {
        contractId: dto.contractId,
        cliente: dto.cliente,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        hora: dto.hora,
        pasajeros: dto.pasajeros,
        origen: dto.origen,
        origenLat: dto.origenLat,
        origenLng: dto.origenLng,
        destino: dto.destino,
        destinoLat: dto.destinoLat,
        destinoLng: dto.destinoLng,
        parada1: dto.parada1,
        parada2: dto.parada2,
        parada3: dto.parada3,
        tipoVehiculo: dto.tipoVehiculo,
        observaciones: dto.observaciones,
        dynamicData: dto.dynamicData ? JSON.stringify(dto.dynamicData) : undefined,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        status: dto.status,
        rutaManual: dto.rutaManual,
        routeJson: dto.routeJson ? JSON.stringify(dto.routeJson) : undefined,
        distanciaKm: dto.distanciaKm,
        duracionMin: dto.duracionMin,
        ...(dto.items ? { valorTotal: totals.valor, costoTotal: totals.costo } : {}),
        ...(dto.items
          ? { items: { create: dto.items.map((it) => this.parseItem(it)) } }
          : {}),
      },
      include: { items: true },
    });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'Service', entityId: id, data: dto });
    return s;
  }

  async remove(id: string, userId?: string) {
    await this.prisma.service.delete({ where: { id } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'Service', entityId: id });
    return { ok: true };
  }

  async assign(id: string, dto: AssignServiceDto, userId?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
    const driver = await this.prisma.driver.findUnique({ where: { id: dto.driverId } });
    if (!vehicle || !driver) throw new BadRequestException('Vehículo o conductor inválido');

    const s = await this.prisma.service.update({
      where: { id },
      data: {
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        status: 'ASIGNADO',
      },
    });
    await this.audit.log({ userId, action: 'ASSIGN', entity: 'Service', entityId: id, data: dto });
    return s;
  }

  async setStatus(id: string, status: any, userId?: string) {
    const updates: any = { status };
    if (status === 'EN_EJECUCION') {
      const s = await this.prisma.service.findUnique({ where: { id } });
      if (s?.vehicleId) {
        await this.prisma.vehicle.update({ where: { id: s.vehicleId }, data: { estado: 'EN_SERVICIO' } });
      }
    }
    if (status === 'COMPLETADO' || status === 'CANCELADO') {
      const s = await this.prisma.service.findUnique({ where: { id } });
      if (s?.vehicleId) {
        await this.prisma.vehicle.update({ where: { id: s.vehicleId }, data: { estado: 'DISPONIBLE' } });
      }
    }
    const s = await this.prisma.service.update({ where: { id }, data: updates });
    await this.audit.log({ userId, action: 'STATUS', entity: 'Service', entityId: id, data: { status } });
    return s;
  }

  /** Motor de sugerencia simple: vehículo con capacidad suficiente + conductor activo. */
  async suggest(serviceId: string) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundException();

    // Vehículos disponibles con capacidad suficiente y (opcional) tipo igual
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        estado: 'DISPONIBLE',
        capacidadPasajeros: { gte: service.pasajeros },
        ...(service.tipoVehiculo ? { tipo: service.tipoVehiculo } : {}),
      },
      include: { assignments: { where: { active: true }, include: { driver: true } } },
      take: 10,
    });

    // Conductores activos
    const drivers = await this.prisma.driver.findMany({
      where: { estado: 'ACTIVO' },
      take: 20,
    });

    // Calcular distancia residencia -> origen (Haversine simple) si tenemos coords
    const ranked = drivers
      .map((d) => {
        let dist: number | null = null;
        if (
          d.residenciaLat != null &&
          d.residenciaLng != null &&
          service.origenLat != null &&
          service.origenLng != null
        ) {
          dist = haversine(d.residenciaLat, d.residenciaLng, service.origenLat, service.origenLng);
        }
        return { ...d, distanciaKmDesdeResidencia: dist };
      })
      .sort(
        (a, b) =>
          (a.distanciaKmDesdeResidencia ?? Infinity) -
          (b.distanciaKmDesdeResidencia ?? Infinity),
      );

    return {
      vehicles,
      drivers: ranked.slice(0, 5),
      best:
        vehicles[0] && ranked[0]
          ? { vehicleId: vehicles[0].id, driverId: ranked[0].id }
          : null,
    };
  }

  private computeTotals(items: ServiceItemDto[]) {
    let valor = 0;
    let costo = 0;
    items.forEach((it) => {
      const q = it.quantity ?? 1;
      valor += (it.unitPrice ?? 0) * q;
      costo += (it.cost ?? 0) * q;
    });
    return { valor, costo };
  }

  private parseItem(it: ServiceItemDto) {
    const q = it.quantity ?? 1;
    const up = it.unitPrice ?? 0;
    return {
      productId: it.productId,
      quantity: q,
      unitPrice: up,
      cost: it.cost ?? 0,
      total: up * q,
    };
  }
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
