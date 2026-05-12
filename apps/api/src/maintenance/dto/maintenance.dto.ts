import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaintenanceType } from '@prisma/client';

export class CreateMaintenanceDto {
  @IsString() vehicleId: string;
  @IsEnum(MaintenanceType) type: MaintenanceType;
  @IsString() description: string;
  @IsOptional() @IsString() taller?: string;
  @IsOptional() @IsNumber() cost?: number;
  @IsOptional() @IsDateString() performedAt?: string;
  @IsOptional() @IsInt() kilometraje?: number;
  @IsOptional() @IsDateString() nextDate?: string;
  @IsOptional() @IsInt() nextKilometraje?: number;
}
