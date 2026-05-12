import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { ContractFieldDto, CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  list() {
    return this.prisma.contract.findMany({
      include: { fields: { orderBy: { order: 'asc' } }, _count: { select: { services: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const c = await this.prisma.contract.findUnique({
      where: { id },
      include: { fields: { orderBy: { order: 'asc' } }, products: true },
    });
    if (!c) throw new NotFoundException('Contrato no encontrado');
    return c;
  }

  async create(dto: CreateContractDto, userId?: string) {
    const c = await this.prisma.contract.create({
      data: {
        name: dto.name,
        cliente: dto.cliente,
        description: dto.description,
        active: dto.active ?? true,
        fields: { create: dto.fields.map((f, i) => this.serializeField(f, i)) },
      },
      include: { fields: true },
    });
    await this.audit.log({ userId, action: 'CREATE', entity: 'Contract', entityId: c.id, data: dto });
    return c;
  }

  async update(id: string, dto: UpdateContractDto, userId?: string) {
    // Recreate fields (simplest correct approach)
    await this.prisma.contractField.deleteMany({ where: { contractId: id } });
    const c = await this.prisma.contract.update({
      where: { id },
      data: {
        name: dto.name,
        cliente: dto.cliente,
        description: dto.description,
        active: dto.active ?? true,
        fields: { create: dto.fields.map((f, i) => this.serializeField(f, i)) },
      },
      include: { fields: true },
    });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'Contract', entityId: id, data: dto });
    return c;
  }

  async remove(id: string, userId?: string) {
    await this.prisma.contract.delete({ where: { id } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'Contract', entityId: id });
    return { ok: true };
  }

  private serializeField(f: ContractFieldDto, index: number) {
    return {
      key: f.key,
      label: f.label,
      type: f.type,
      required: f.required ?? false,
      options: f.options ? JSON.stringify(f.options) : null,
      order: f.order ?? index,
    };
  }
}
