import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Financial')
@ApiBearerAuth()
@Controller('financial')
export class FinancialController {
  constructor(private service: FinancialService) {}

  @Get('products')
  list(@Query('contractId') contractId?: string) {
    return this.service.listProducts(contractId);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Post('products')
  create(@Body() dto: CreateProductDto, @CurrentUser('id') userId: string) {
    return this.service.createProduct(dto, userId);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Patch('products/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser('id') userId: string) {
    return this.service.updateProduct(id, dto, userId);
  }

  @Roles('ADMIN')
  @Delete('products/:id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.removeProduct(id, userId);
  }

  @Get('summary')
  summary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.service.summary(from, to);
  }
}
