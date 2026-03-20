import { IsString, IsEnum, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { CareRecordCategory } from '../../common/enums';

export class UpdateCareRecordDto {
  @IsOptional()
  @IsDateString()
  recordDate?: string;

  @IsOptional()
  @IsEnum(CareRecordCategory)
  category?: CareRecordCategory;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

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
