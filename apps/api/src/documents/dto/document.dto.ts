import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsEnum(DocumentType) type: DocumentType;
  @IsString() name: string;
  @IsOptional() @IsString() fileUrl?: string;
  @IsOptional() @IsDateString() issuedAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() vehicleId?: string;
  @IsOptional() @IsString() driverId?: string;
}
