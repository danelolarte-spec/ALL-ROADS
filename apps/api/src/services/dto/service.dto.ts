import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceStatus } from '@prisma/client';

export class ServiceItemDto {
  @IsString() productId: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsNumber() unitPrice?: number;
  @IsOptional() @IsNumber() cost?: number;
}

export class CreateServiceDto {
  @IsString() contractId: string;
  @IsString() cliente: string;
  @IsDateString() fecha: string;
  @IsOptional() @IsString() hora?: string;
  @IsOptional() @IsInt() pasajeros?: number;
  @IsString() origen: string;
  @IsOptional() @IsNumber() origenLat?: number;
  @IsOptional() @IsNumber() origenLng?: number;
  @IsString() destino: string;
  @IsOptional() @IsNumber() destinoLat?: number;
  @IsOptional() @IsNumber() destinoLng?: number;
  @IsOptional() @IsString() parada1?: string;
  @IsOptional() @IsString() parada2?: string;
  @IsOptional() @IsString() parada3?: string;
  @IsOptional() @IsString() tipoVehiculo?: string;
  @IsOptional() @IsString() observaciones?: string;
  @IsOptional() dynamicData?: Record<string, any>;
  @IsOptional() @IsString() vehicleId?: string;
  @IsOptional() @IsString() driverId?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ServiceItemDto) items?: ServiceItemDto[];
}

export class UpdateServiceDto extends CreateServiceDto {
  @IsOptional() @IsEnum(ServiceStatus) status?: ServiceStatus;
  @IsOptional() @IsBoolean() rutaManual?: boolean;
  @IsOptional() routeJson?: any;
  @IsOptional() @IsNumber() distanciaKm?: number;
  @IsOptional() @IsInt() duracionMin?: number;
}

export class AssignServiceDto {
  @IsString() vehicleId: string;
  @IsString() driverId: string;
}
