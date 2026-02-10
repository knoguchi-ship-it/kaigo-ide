import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { Gender, CareLevel } from '@prisma/client';

export class CreateClientDto {
  @IsString()
  tenantId!: string;

  @IsString()
  familyName!: string;

  @IsString()
  givenName!: string;

  @IsString()
  familyNameKana!: string;

  @IsString()
  givenNameKana!: string;

  @IsDateString()
  birthDate!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  insuranceNumber!: string;

  @IsEnum(CareLevel)
  careLevel!: CareLevel;

  @IsDateString()
  certificationDate!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
