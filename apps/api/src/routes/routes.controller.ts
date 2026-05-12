import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoutesService, RoutePoint } from './routes.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Routes')
@ApiBearerAuth()
@Controller('routes')
export class RoutesController {
  constructor(private service: RoutesService) {}

  @Post('calculate')
  calculate(@Body() body: { points: RoutePoint[] }) {
    return this.service.calculate(body.points);
  }

  @Roles('ADMIN', 'OPERACIONES')
  @Post('service/:serviceId')
  save(
    @Body() body: { serviceId: string; route: any; manual?: boolean },
    @CurrentUser('id') userId: string,
  ) {
    return this.service.saveForService(body.serviceId, body.route, body.manual ?? false, userId);
  }
}
