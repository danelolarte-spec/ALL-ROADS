import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/maintenance.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenance')
export class MaintenanceController {
  constructor(private service: MaintenanceService) {}

  @Get()
  list(@Query('vehicleId') vehicleId?: string) {
    return this.service.list(vehicleId);
  }

  @Get('alerts')
  alerts() {
    return this.service.alerts();
  }

  @Get('costs')
  costs() {
    return this.service.costsByVehicle();
  }

  @Roles('ADMIN', 'MANTENIMIENTO', 'OPERACIONES')
  @Post()
  create(@Body() dto: CreateMaintenanceDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
