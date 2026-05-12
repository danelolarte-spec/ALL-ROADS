import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './common/audit.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { HrModule } from './hr/hr.module';
import { DocumentsModule } from './documents/documents.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ContractsModule } from './contracts/contracts.module';
import { ServicesModule } from './services/services.module';
import { ExcelModule } from './excel/excel.module';
import { OperationsModule } from './operations/operations.module';
import { RoutesModule } from './routes/routes.module';
import { FinancialModule } from './financial/financial.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    VehiclesModule,
    DriversModule,
    HrModule,
    DocumentsModule,
    MaintenanceModule,
    ContractsModule,
    ServicesModule,
    ExcelModule,
    OperationsModule,
    RoutesModule,
    FinancialModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
