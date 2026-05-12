import { Module } from '@nestjs/common';
import { ExcelController } from './excel.controller';
import { ExcelService } from './excel.service';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [ServicesModule],
  controllers: [ExcelController],
  providers: [ExcelService],
})
export class ExcelModule {}
