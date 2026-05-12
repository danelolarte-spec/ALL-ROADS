import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OperationsService } from './operations.service';

@ApiTags('Operations')
@ApiBearerAuth()
@Controller('operations')
export class OperationsController {
  constructor(private service: OperationsService) {}

  @Get('board')
  board() {
    return this.service.board();
  }
}
