import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString() code: string;
  @IsString() name: string;
  @IsNumber() unitPrice: number;
  @IsOptional() @IsNumber() cost?: number;
  @IsOptional() @IsString() contractId?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdateProductDto extends CreateProductDto {}
