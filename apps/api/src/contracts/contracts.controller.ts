import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(private service: ContractsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Post()
  create(@Body() dto: CreateContractDto, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto, @CurrentUser('id') userId: string) {
    return this.service.update(id, dto, userId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, userId);
  }
}
