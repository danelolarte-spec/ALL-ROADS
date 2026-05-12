import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { AssignVehicleDto, CreateDriverDto, UpdateDriverDto } from './dto/driver.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private service: DriversService) {}

  @Get()
  list(@Query('search') search?: string) {
    return this.service.list(search);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Roles('ADMIN', 'OPERACIONES', 'GESTION_HUMANA')
  @Post()
  create(@Body() dto: CreateDriverDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Roles('ADMIN', 'OPERACIONES', 'GESTION_HUMANA')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto, @CurrentUser('id') userId: string) {
    return this.service.update(id, dto, userId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Post('assignments')
  assign(@Body() dto: AssignVehicleDto, @CurrentUser('id') userId: string) {
    return this.service.assignVehicle(dto, userId);
  }
}
