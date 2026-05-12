import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  /** Expediente completo de un conductor (documentación humana + asignaciones). */
  async expediente(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        documents: { orderBy: { expiresAt: 'asc' } },
        assignments: { include: { vehicle: true }, orderBy: { fromDate: 'desc' } },
      },
    });
    if (!driver) throw new NotFoundException('Conductor no encontrado');

    const today = new Date();
    const documentos = driver.documents.map((d) => {
      const days = d.expiresAt
        ? Math.ceil((d.expiresAt.getTime() - today.getTime()) / 86400000)
        : null;
      const status =
        days == null ? 'sinFecha' : days < 0 ? 'vencido' : days <= 30 ? 'porVencer' : 'vigente';
      return { ...d, days, status };
    });

    return { ...driver, documents: documentos };
  }

  /** Alertas RRHH: licencias + documentos del conductor por vencer. */
  async alerts() {
    const today = new Date();
    const in60 = new Date(today.getTime() + 60 * 86400000);

    const drivers = await this.prisma.driver.findMany({
      where: { licenciaVence: { lte: in60 } },
      select: { id: true, fullName: true, licenciaVence: true, categoriaLicencia: true },
    });
    const docs = await this.prisma.document.findMany({
      where: { driverId: { not: null }, expiresAt: { not: null, lte: in60 } },
      include: { driver: true },
    });
    return {
      licencias: drivers.map((d) => ({
        ...d,
        days: Math.ceil((d.licenciaVence.getTime() - today.getTime()) / 86400000),
      })),
      documentos: docs.map((d) => ({
        id: d.id,
        type: d.type,
        name: d.name,
        expiresAt: d.expiresAt,
        days: Math.ceil((d.expiresAt!.getTime() - today.getTime()) / 86400000),
        driver: d.driver ? { id: d.driver.id, fullName: d.driver.fullName } : null,
      })),
    };
  }
}
