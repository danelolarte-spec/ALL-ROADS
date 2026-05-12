import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private service: VehiclesService) {}

  @Get()
  list(@Query('status') status?: string, @Query('search') search?: string) {
    return this.service.list({ status, search });
  }

  @Get('expirations')
  expirations() {
    return this.service.expirationStatus();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Roles('ADMIN', 'OPERACIONES', 'MANTENIMIENTO')
  @Post()
  create(@Body() dto: CreateVehicleDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Roles('ADMIN', 'OPERACIONES', 'MANTENIMIENTO')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentUser('id') userId: string) {
    return this.service.update(id, dto, userId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
