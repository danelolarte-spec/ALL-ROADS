import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { CreateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list(query?: { vehicleId?: string; driverId?: string }) {
    return this.prisma.document.findMany({
      where: query,
      orderBy: { expiresAt: 'asc' },
    });
  }

  async create(dto: CreateDocumentDto, userId?: string) {
    const d = await this.prisma.document.create({
      data: {
        type: dto.type,
        name: dto.name,
        fileUrl: dto.fileUrl,
        issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        notes: dto.notes,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entity: 'Document', entityId: d.id, data: dto });
    return d;
  }

  async remove(id: string, userId?: string) {
    await this.prisma.document.delete({ where: { id } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'Document', entityId: id });
    return { ok: true };
  }

  /** Alertas de vencimientos (próximos 60 días + vencidos). */
  async alerts() {
    const today = new Date();
    const in60 = new Date(today.getTime() + 60 * 86400000);
    const docs = await this.prisma.document.findMany({
      where: { expiresAt: { not: null, lte: in60 } },
      include: { vehicle: true, driver: true },
      orderBy: { expiresAt: 'asc' },
    });
    return docs.map((d) => {
      const days = Math.ceil((d.expiresAt!.getTime() - today.getTime()) / 86400000);
      return {
        id: d.id,
        type: d.type,
        name: d.name,
        expiresAt: d.expiresAt,
        days,
        status: days < 0 ? 'vencido' : days <= 15 ? 'critico' : 'porVencer',
        vehicle: d.vehicle ? { id: d.vehicle.id, placa: d.vehicle.placa } : null,
        driver: d.driver ? { id: d.driver.id, fullName: d.driver.fullName } : null,
      };
    });
  }
}
