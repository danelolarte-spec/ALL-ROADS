import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DriverStatus, AssignmentType } from '@prisma/client';

export class CreateDriverDto {
  @IsString() fullName: string;
  @IsString() documento: string;
  @IsString() licencia: string;
  @IsString() categoriaLicencia: string;
  @IsDateString() licenciaVence: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsNumber() residenciaLat?: number;
  @IsOptional() @IsNumber() residenciaLng?: number;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() contactoEmergencia?: string;
  @IsOptional() @IsEnum(DriverStatus) estado?: DriverStatus;
  @IsOptional() @IsString() observaciones?: string;
}

export class UpdateDriverDto extends CreateDriverDto {}

export class AssignVehicleDto {
  @IsString() vehicleId: string;
  @IsString() driverId: string;
  @IsOptional() @IsEnum(AssignmentType) type?: AssignmentType;
  @IsOptional() @IsDateString() fromDate?: string;
  @IsOptional() @IsDateString() toDate?: string;
}
