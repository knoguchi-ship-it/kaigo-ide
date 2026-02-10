import { IsString, IsEnum, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { CareRecordCategory } from '@prisma/client';

export class CreateCareRecordDto {
  @IsDateString()
  recordDate!: string;

  @IsEnum(CareRecordCategory)
  category!: CareRecordCategory;

  @IsString()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsString()
  relatedOrganization?: string;

  @IsOptional()
  @IsString()
  professionalJudgment?: string;

  @IsOptional()
  @IsString()
  clientFamilyOpinion?: string;
}
