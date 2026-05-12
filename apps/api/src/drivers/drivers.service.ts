import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { AssignVehicleDto, CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(search?: string) {
    return this.prisma.driver.findMany({
      where: search
        ? {
            OR: [
              { fullName: { contains: search } },
              { documento: { contains: search } },
              { licencia: { contains: search } },
            ],
          }
        : undefined,
      include: { assignments: { where: { active: true }, include: { vehicle: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const d = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { expiresAt: 'asc' } },
        assignments: { include: { vehicle: true }, orderBy: { fromDate: 'desc' } },
      },
    });
    if (!d) throw new NotFoundException('Conductor no encontrado');
    return d;
  }

  async create(dto: CreateDriverDto, userId?: string) {
    const d = await this.prisma.driver.create({
      data: { ...dto, licenciaVence: new Date(dto.licenciaVence) },
    });
    await this.audit.log({ userId, action: 'CREATE', entity: 'Driver', entityId: d.id, data: dto });
    return d;
  }

  async update(id: string, dto: UpdateDriverDto, userId?: string) {
    const d = await this.prisma.driver.update({
      where: { id },
      data: { ...dto, licenciaVence: dto.licenciaVence ? new Date(dto.licenciaVence) : undefined },
    });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'Driver', entityId: id, data: dto });
    return d;
  }

  async remove(id: string, userId?: string) {
    await this.prisma.driver.delete({ where: { id } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'Driver', entityId: id });
    return { ok: true };
  }

  async assignVehicle(dto: AssignVehicleDto, userId?: string) {
    if (dto.type === 'FIJA' || !dto.type) {
      // deactivate previous fixed assignments
      await this.prisma.vehicleAssignment.updateMany({
        where: { driverId: dto.driverId, active: true, type: 'FIJA' },
        data: { active: false, toDate: new Date() },
      });
    }
    const a = await this.prisma.vehicleAssignment.create({
      data: {
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        type: dto.type || 'FIJA',
        fromDate: dto.fromDate ? new Date(dto.fromDate) : new Date(),
        toDate: dto.toDate ? new Date(dto.toDate) : null,
      },
    });
    await this.audit.log({ userId, action: 'ASSIGN', entity: 'VehicleAssignment', entityId: a.id, data: dto });
    return a;
  }
}
