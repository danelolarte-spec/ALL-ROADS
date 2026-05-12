import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(query?: { status?: string; search?: string }) {
    return this.prisma.vehicle.findMany({
      where: {
        ...(query?.status ? { estado: query.status as any } : {}),
        ...(query?.search
          ? {
              OR: [
                { placa: { contains: query.search } },
                { marca: { contains: query.search } },
                { numeroInterno: { contains: query.search } },
              ],
            }
          : {}),
      },
      include: { documents: true, assignments: { where: { active: true }, include: { driver: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const v = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { expiresAt: 'asc' } },
        maintenances: { orderBy: { performedAt: 'desc' } },
        assignments: { include: { driver: true }, orderBy: { fromDate: 'desc' } },
      },
    });
    if (!v) throw new NotFoundException('Vehículo no encontrado');
    return v;
  }

  async create(dto: CreateVehicleDto, userId?: string) {
    const v = await this.prisma.vehicle.create({ data: this.parse(dto) });
    await this.audit.log({ userId, action: 'CREATE', entity: 'Vehicle', entityId: v.id, data: dto });
    return v;
  }

  async update(id: string, dto: UpdateVehicleDto, userId?: string) {
    const v = await this.prisma.vehicle.update({ where: { id }, data: this.parse(dto) });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'Vehicle', entityId: id, data: dto });
    return v;
  }

  async remove(id: string, userId?: string) {
    await this.prisma.vehicle.delete({ where: { id } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'Vehicle', entityId: id });
    return { ok: true };
  }

  private parse(dto: any) {
    return {
      ...dto,
      soatVence: dto.soatVence ? new Date(dto.soatVence) : undefined,
      tecnomecanicaVence: dto.tecnomecanicaVence ? new Date(dto.tecnomecanicaVence) : undefined,
      tarjetaOperVence: dto.tarjetaOperVence ? new Date(dto.tarjetaOperVence) : undefined,
    };
  }

  /** Semáforo de vencimientos (verde / amarillo / rojo) por vehículo. */
  async expirationStatus() {
    const vehicles = await this.prisma.vehicle.findMany({
      select: { id: true, placa: true, soatVence: true, tecnomecanicaVence: true, tarjetaOperVence: true },
    });
    const today = new Date();
    return vehicles.map((v) => {
      const items = [
        { name: 'SOAT', date: v.soatVence },
        { name: 'Tecnomecánica', date: v.tecnomecanicaVence },
        { name: 'Tarjeta operación', date: v.tarjetaOperVence },
      ].map((it) => {
        if (!it.date) return { ...it, status: 'desconocido' as const, days: null };
        const days = Math.ceil((it.date.getTime() - today.getTime()) / 86400000);
        const status = days < 0 ? 'vencido' : days <= 30 ? 'porVencer' : 'vigente';
        return { ...it, status, days };
      });
      const worst = items.some((i) => i.status === 'vencido')
        ? 'rojo'
        : items.some((i) => i.status === 'porVencer')
        ? 'amarillo'
        : 'verde';
      return { id: v.id, placa: v.placa, semaforo: worst, items };
    });
  }
}
