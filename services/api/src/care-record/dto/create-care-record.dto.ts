import { IsString, IsEnum, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateCareRecordDto {
  @IsDateString()
  recordDate!: string;

  @IsEnum(['VISIT', 'PHONE', 'FAX', 'MAIL', 'CONFERENCE', 'OTHER'])
  category!: 'VISIT' | 'PHONE' | 'FAX' | 'MAIL' | 'CONFERENCE' | 'OTHER';

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
