import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '@prisma/client';

export class ContractFieldDto {
  @IsOptional() @IsString() id?: string;
  @IsString() key: string;
  @IsString() label: string;
  @IsEnum(FieldType) type: FieldType;
  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional() @IsArray() options?: string[];
  @IsOptional() @IsInt() order?: number;
}

export class CreateContractDto {
  @IsString() name: string;
  @IsString() cliente: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsArray() @ValidateNested({ each: true }) @Type(() => ContractFieldDto) fields: ContractFieldDto[];
}

export class UpdateContractDto extends CreateContractDto {}
