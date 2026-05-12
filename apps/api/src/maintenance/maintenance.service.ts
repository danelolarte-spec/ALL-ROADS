import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { CreateMaintenanceDto } from './dto/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(vehicleId?: string) {
    return this.prisma.maintenance.findMany({
      where: vehicleId ? { vehicleId } : undefined,
      include: { vehicle: true },
      orderBy: { performedAt: 'desc' },
    });
  }

  async create(dto: CreateMaintenanceDto, userId?: string) {
    const m = await this.prisma.maintenance.create({
      data: {
        ...dto,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : new Date(),
        nextDate: dto.nextDate ? new Date(dto.nextDate) : null,
      },
    });
    // Si registramos mantenimiento, actualizamos kilometraje del vehículo si vino info
    if (dto.kilometraje) {
      await this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { kilometraje: dto.kilometraje },
      });
    }
    await this.audit.log({ userId, action: 'CREATE', entity: 'Maintenance', entityId: m.id, data: dto });
    return m;
  }

  async remove(id: string, userId?: string) {
    await this.prisma.maintenance.delete({ where: { id } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'Maintenance', entityId: id });
    return { ok: true };
  }

  /** Costos acumulados por vehículo (todas las categorías). */
  async costsByVehicle() {
    const rows = await this.prisma.maintenance.groupBy({
      by: ['vehicleId'],
      _sum: { cost: true },
      _count: { _all: true },
    });
    const vehicles = await this.prisma.vehicle.findMany({
      where: { id: { in: rows.map((r) => r.vehicleId) } },
      select: { id: true, placa: true },
    });
    const map = new Map(vehicles.map((v) => [v.id, v.placa]));
    return rows.map((r) => ({
      vehicleId: r.vehicleId,
      placa: map.get(r.vehicleId),
      total: r._sum.cost ?? 0,
      count: r._count._all,
    }));
  }

  /** Alertas de próximo mantenimiento (por fecha). */
  async alerts() {
    const today = new Date();
    const in30 = new Date(today.getTime() + 30 * 86400000);
    const items = await this.prisma.maintenance.findMany({
      where: { nextDate: { not: null, lte: in30 } },
      include: { vehicle: true },
      orderBy: { nextDate: 'asc' },
    });
    return items.map((m) => ({
      id: m.id,
      type: m.type,
      vehicle: { id: m.vehicleId, placa: m.vehicle.placa },
      nextDate: m.nextDate,
      nextKilometraje: m.nextKilometraje,
      days: Math.ceil((m.nextDate!.getTime() - today.getTime()) / 86400000),
    }));
  }
}
