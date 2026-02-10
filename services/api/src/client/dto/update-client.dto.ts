import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { Gender, CareLevel } from '@prisma/client';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  familyName?: string;

  @IsOptional()
  @IsString()
  givenName?: string;

  @IsOptional()
  @IsString()
  familyNameKana?: string;

  @IsOptional()
  @IsString()
  givenNameKana?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  insuranceNumber?: string;

  @IsOptional()
  @IsEnum(CareLevel)
  careLevel?: CareLevel;

  @IsOptional()
  @IsDateString()
  certificationDate?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
