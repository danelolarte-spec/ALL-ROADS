import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';
import { ServicesService } from '../services/services.service';

const BASE_COLS = [
  'cliente',
  'fecha',
  'hora',
  'pasajeros',
  'origen',
  'destino',
  'parada1',
  'parada2',
  'parada3',
  'tipoVehiculo',
  'observaciones',
];

@Injectable()
export class ExcelService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private services: ServicesService,
  ) {}

  /** Genera plantilla XLSX dinámica para un contrato. */
  async template(contractId: string): Promise<Buffer> {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { fields: { orderBy: { order: 'asc' } } },
    });
    if (!contract) throw new NotFoundException('Contrato no encontrado');

    const dynamicCols = contract.fields.map((f) => f.key);
    const headers = [...BASE_COLS, ...dynamicCols];
    const example: Record<string, any> = {
      cliente: contract.cliente,
      fecha: '2026-05-15',
      hora: '08:00',
      pasajeros: 1,
      origen: 'Cra 7 # 100-00, Bogotá',
      destino: 'Aeropuerto El Dorado',
      tipoVehiculo: 'Sedán',
    };
    contract.fields.forEach((f) => {
      example[f.key] = f.type === 'NUMBER' ? 0 : f.type === 'DATE' ? '2026-05-15' : '';
    });

    const ws = XLSX.utils.json_to_sheet([example], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Servicios');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf;
  }

  /** Previsualiza un Excel (sin insertar). Devuelve filas + errores. */
  async preview(contractId: string, fileBuffer: Buffer) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { fields: { orderBy: { order: 'asc' } } },
    });
    if (!contract) throw new NotFoundException('Contrato no encontrado');

    const wb = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const requiredDynamic = contract.fields.filter((f) => f.required).map((f) => f.key);

    const validated = rows.map((row, idx) => {
      const errors: string[] = [];
      ['cliente', 'fecha', 'origen', 'destino'].forEach((c) => {
        if (!row[c]) errors.push(`Falta ${c}`);
      });
      requiredDynamic.forEach((k) => {
        if (row[k] == null || row[k] === '') errors.push(`Falta campo dinámico "${k}"`);
      });
      return { row: idx + 2, data: row, errors };
    });
    return {
      total: rows.length,
      validCount: validated.filter((v) => v.errors.length === 0).length,
      errorCount: validated.filter((v) => v.errors.length > 0).length,
      rows: validated,
    };
  }

  /** Importa el Excel, creando servicios. Salta filas inválidas. */
  async import(contractId: string, fileBuffer: Buffer, userId?: string) {
    const preview = await this.preview(contractId, fileBuffer);
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { fields: true },
    });
    if (!contract) throw new BadRequestException('Contrato no encontrado');

    const dynamicKeys = contract.fields.map((f) => f.key);
    let created = 0;
    const errors: any[] = [];

    for (const r of preview.rows) {
      if (r.errors.length > 0) {
        errors.push({ row: r.row, errors: r.errors });
        continue;
      }
      const data = r.data;
      const dynamicData: Record<string, any> = {};
      dynamicKeys.forEach((k) => (dynamicData[k] = data[k]));
      try {
        await this.services.create(
          {
            contractId,
            cliente: data.cliente,
            fecha: typeof data.fecha === 'string' ? data.fecha : new Date(data.fecha).toISOString(),
            hora: data.hora || undefined,
            pasajeros: Number(data.pasajeros || 1),
            origen: data.origen,
            destino: data.destino,
            parada1: data.parada1 || undefined,
            parada2: data.parada2 || undefined,
            parada3: data.parada3 || undefined,
            tipoVehiculo: data.tipoVehiculo || undefined,
            observaciones: data.observaciones || undefined,
            dynamicData,
          } as any,
          userId,
        );
        created += 1;
      } catch (e: any) {
        errors.push({ row: r.row, errors: [e.message] });
      }
    }

    await this.audit.log({
      userId,
      action: 'IMPORT_EXCEL',
      entity: 'Service',
      data: { contractId, created, errors: errors.length },
    });
    return { created, errors, total: preview.total };
  }
}
