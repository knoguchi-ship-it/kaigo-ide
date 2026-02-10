import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';

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

  @IsEnum(['MALE', 'FEMALE'])
  gender!: 'MALE' | 'FEMALE';

  @IsString()
  insuranceNumber!: string;

  @IsEnum([
    'SUPPORT_1',
    'SUPPORT_2',
    'CARE_1',
    'CARE_2',
    'CARE_3',
    'CARE_4',
    'CARE_5',
  ])
  careLevel!: string;

  @IsDateString()
  certificationDate!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
