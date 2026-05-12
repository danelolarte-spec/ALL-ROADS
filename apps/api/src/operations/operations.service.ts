import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OperationsService {
  constructor(private prisma: PrismaService) {}

  /** Estado del tablero operativo. */
  async board() {
    const [
      vehiclesDisponibles,
      vehiclesOcupados,
      driversActivos,
      pendientes,
      asignados,
      enEjecucion,
    ] = await Promise.all([
      this.prisma.vehicle.findMany({ where: { estado: 'DISPONIBLE' } }),
      this.prisma.vehicle.findMany({ where: { estado: 'EN_SERVICIO' } }),
      this.prisma.driver.findMany({
        where: { estado: 'ACTIVO' },
        include: { assignments: { where: { active: true }, include: { vehicle: true } } },
      }),
      this.prisma.service.findMany({
        where: { status: 'PENDIENTE' },
        include: { contract: true },
        orderBy: { fecha: 'asc' },
        take: 50,
      }),
      this.prisma.service.findMany({
        where: { status: 'ASIGNADO' },
        include: { vehicle: true, driver: true, contract: true },
        orderBy: { fecha: 'asc' },
        take: 50,
      }),
      this.prisma.service.findMany({
        where: { status: 'EN_EJECUCION' },
        include: { vehicle: true, driver: true, contract: true },
        orderBy: { fecha: 'asc' },
        take: 50,
      }),
    ]);

    return {
      counters: {
        vehiclesDisponibles: vehiclesDisponibles.length,
        vehiclesOcupados: vehiclesOcupados.length,
        driversActivos: driversActivos.length,
        pendientes: pendientes.length,
        asignados: asignados.length,
        enEjecucion: enEjecucion.length,
      },
      vehiclesDisponibles,
      vehiclesOcupados,
      driversActivos,
      services: {
        pendientes,
        asignados,
        enEjecucion,
      },
    };
  }
}
