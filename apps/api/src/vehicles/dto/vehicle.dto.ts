import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @IsString() placa: string;
  @IsOptional() @IsString() numeroInterno?: string;
  @IsString() tipo: string;
  @IsString() marca: string;
  @IsOptional() @IsString() linea?: string;
  @IsInt() modelo: number;
  @IsOptional() @IsInt() capacidadPasajeros?: number;
  @IsOptional() @IsNumber() capacidadCarga?: number;
  @IsOptional() @IsEnum(VehicleStatus) estado?: VehicleStatus;
  @IsOptional() @IsInt() kilometraje?: number;
  @IsOptional() @IsString() empresaAfiliadora?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() @IsDateString() soatVence?: string;
  @IsOptional() @IsDateString() tecnomecanicaVence?: string;
  @IsOptional() @IsDateString() tarjetaOperVence?: string;
}

export class UpdateVehicleDto extends CreateVehicleDto {}
