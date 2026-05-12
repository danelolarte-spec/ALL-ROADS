import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { AssignServiceDto, CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(private service: ServicesService) {}

  @Get()
  list(@Query('status') status?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.list({ status, from, to });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Get(':id/suggest')
  suggest(@Param('id') id: string) {
    return this.service.suggest(id);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Post()
  create(@Body() dto: CreateServiceDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto, @CurrentUser('id') userId: string) {
    return this.service.update(id, dto, userId);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignServiceDto, @CurrentUser('id') userId: string) {
    return this.service.assign(id, dto, userId);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Post(':id/status')
  setStatus(@Param('id') id: string, @Body() body: { status: string }, @CurrentUser('id') userId: string) {
    return this.service.setStatus(id, body.status, userId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
