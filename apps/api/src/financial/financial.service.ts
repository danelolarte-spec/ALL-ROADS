import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  listProducts(contractId?: string) {
    return this.prisma.product.findMany({
      where: contractId ? { contractId } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(dto: CreateProductDto, userId?: string) {
    const p = await this.prisma.product.create({ data: dto });
    await this.audit.log({ userId, action: 'CREATE', entity: 'Product', entityId: p.id, data: dto });
    return p;
  }

  async updateProduct(id: string, dto: UpdateProductDto, userId?: string) {
    const p = await this.prisma.product.update({ where: { id }, data: dto });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'Product', entityId: id, data: dto });
    return p;
  }

  async removeProduct(id: string, userId?: string) {
    await this.prisma.product.delete({ where: { id } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'Product', entityId: id });
    return { ok: true };
  }

  /** Resumen financiero por vehículo, conductor y cliente. */
  async summary(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.fecha = {};
      if (from) where.fecha.gte = new Date(from);
      if (to) where.fecha.lte = new Date(to);
    }
    where.status = { in: ['ASIGNADO', 'EN_EJECUCION', 'COMPLETADO'] };

    const services = await this.prisma.service.findMany({
      where,
      include: { vehicle: true, driver: true },
    });

    const totalsByVehicle = new Map<string, { placa: string; valor: number; costo: number; count: number }>();
    const totalsByDriver = new Map<string, { name: string; valor: number; costo: number; count: number }>();
    const totalsByCliente = new Map<string, { valor: number; costo: number; count: number }>();

    let totalValor = 0;
    let totalCosto = 0;

    for (const s of services) {
      totalValor += s.valorTotal;
      totalCosto += s.costoTotal;

      if (s.vehicleId && s.vehicle) {
        const cur = totalsByVehicle.get(s.vehicleId) ?? {
          placa: s.vehicle.placa,
          valor: 0,
          costo: 0,
          count: 0,
        };
        cur.valor += s.valorTotal;
        cur.costo += s.costoTotal;
        cur.count += 1;
        totalsByVehicle.set(s.vehicleId, cur);
      }
      if (s.driverId && s.driver) {
        const cur = totalsByDriver.get(s.driverId) ?? {
          name: s.driver.fullName,
          valor: 0,
          costo: 0,
          count: 0,
        };
        cur.valor += s.valorTotal;
        cur.costo += s.costoTotal;
        cur.count += 1;
        totalsByDriver.set(s.driverId, cur);
      }
      const cliente = s.cliente || 'Sin cliente';
      const cur = totalsByCliente.get(cliente) ?? { valor: 0, costo: 0, count: 0 };
      cur.valor += s.valorTotal;
      cur.costo += s.costoTotal;
      cur.count += 1;
      totalsByCliente.set(cliente, cur);
    }

    // Mantenimientos como costo
    const maint = await this.prisma.maintenance.aggregate({
      _sum: { cost: true },
      where:
        from || to
          ? {
              performedAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : undefined,
    });

    return {
      totalValor,
      totalCosto,
      utilidadOperativa: totalValor - totalCosto - (maint._sum.cost ?? 0),
      costoMantenimiento: maint._sum.cost ?? 0,
      byVehicle: Array.from(totalsByVehicle.entries()).map(([id, v]) => ({ vehicleId: id, ...v })),
      byDriver: Array.from(totalsByDriver.entries()).map(([id, d]) => ({ driverId: id, ...d })),
      byCliente: Array.from(totalsByCliente.entries()).map(([cliente, v]) => ({ cliente, ...v })),
    };
  }
}
