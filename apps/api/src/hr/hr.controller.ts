import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HrService } from './hr.service';

@ApiTags('HR (Gestión humana)')
@ApiBearerAuth()
@Controller('hr')
export class HrController {
  constructor(private service: HrService) {}

  @Get('alerts')
  alerts() {
    return this.service.alerts();
  }

  @Get('drivers/:id/expediente')
  expediente(@Param('id') id: string) {
    return this.service.expediente(id);
  }
}
