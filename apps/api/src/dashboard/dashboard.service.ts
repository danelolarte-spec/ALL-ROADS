import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const in30 = new Date(today.getTime() + 30 * 86400000);

    const [
      serviciosHoy,
      serviciosPendientes,
      vehiclesActivos,
      driversActivos,
      ingresosMes,
      costosMes,
      docsPorVencer,
      docsVencidos,
      mantenimientosProximos,
    ] = await Promise.all([
      this.prisma.service.count({ where: { fecha: { gte: startOfDay, lt: endOfDay } } }),
      this.prisma.service.count({ where: { status: 'PENDIENTE' } }),
      this.prisma.vehicle.count({
        where: { estado: { in: ['DISPONIBLE', 'EN_SERVICIO'] } },
      }),
      this.prisma.driver.count({ where: { estado: 'ACTIVO' } }),
      this.prisma.service.aggregate({
        _sum: { valorTotal: true },
        where: { fecha: { gte: startOfMonth, lte: today } },
      }),
      this.prisma.service.aggregate({
        _sum: { costoTotal: true },
        where: { fecha: { gte: startOfMonth, lte: today } },
      }),
      this.prisma.document.count({
        where: { expiresAt: { gte: today, lte: in30 } },
      }),
      this.prisma.document.count({ where: { expiresAt: { lt: today } } }),
      this.prisma.maintenance.count({ where: { nextDate: { gte: today, lte: in30 } } }),
    ]);

    // Serie de servicios últimos 14 días
    const seriesStart = new Date(today.getTime() - 13 * 86400000);
    const recentServices = await this.prisma.service.findMany({
      where: { fecha: { gte: seriesStart } },
      select: { fecha: true, valorTotal: true },
    });
    const seriesMap = new Map<string, { fecha: string; servicios: number; ingresos: number }>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(seriesStart.getTime() + i * 86400000);
      const key = d.toISOString().slice(0, 10);
      seriesMap.set(key, { fecha: key, servicios: 0, ingresos: 0 });
    }
    recentServices.forEach((s) => {
      const key = s.fecha.toISOString().slice(0, 10);
      const cur = seriesMap.get(key);
      if (cur) {
        cur.servicios += 1;
        cur.ingresos += s.valorTotal;
      }
    });

    const ingresos = ingresosMes._sum.valorTotal ?? 0;
    const costos = costosMes._sum.costoTotal ?? 0;

    return {
      kpis: {
        serviciosHoy,
        serviciosPendientes,
        vehiclesActivos,
        driversActivos,
        ingresosMes: ingresos,
        costosMes: costos,
        rentabilidadMes: ingresos - costos,
        rentabilidadPct: ingresos > 0 ? Math.round(((ingresos - costos) / ingresos) * 100) : 0,
        alertasDocumentales: docsPorVencer + docsVencidos,
        docsVencidos,
        mantenimientosProximos,
      },
      series14d: Array.from(seriesMap.values()),
    };
  }
}
