import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExcelService } from './excel.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Excel')
@ApiBearerAuth()
@Controller('excel')
export class ExcelController {
  constructor(private service: ExcelService) {}

  @Get('template/:contractId')
  async template(@Param('contractId') contractId: string, @Res() res: Response) {
    const buf = await this.service.template(contractId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="plantilla-${contractId}.xlsx"`);
    res.send(buf);
  }

  // body: { contractId, base64 }  → simple base64-based upload (sin multer extra config)
  @Roles('ADMIN', 'OPERACIONES')
  @Post('preview')
  preview(@Body() body: { contractId: string; base64: string }) {
    const buf = Buffer.from(body.base64, 'base64');
    return this.service.preview(body.contractId, buf);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Post('import')
  import(@Body() body: { contractId: string; base64: string }, @CurrentUser('id') userId: string) {
    const buf = Buffer.from(body.base64, 'base64');
    return this.service.import(body.contractId, buf, userId);
  }
}
