import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/document.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private service: DocumentsService) {}

  @Get()
  list(@Query('vehicleId') vehicleId?: string, @Query('driverId') driverId?: string) {
    return this.service.list({ vehicleId, driverId });
  }

  @Get('alerts')
  alerts() {
    return this.service.alerts();
  }

  @Roles('ADMIN', 'OPERACIONES', 'GESTION_HUMANA', 'MANTENIMIENTO')
  @Post()
  create(@Body() dto: CreateDocumentDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
