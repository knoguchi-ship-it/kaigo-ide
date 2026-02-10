import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CareRecordQueryDto {
  @IsOptional()
  @IsEnum(['VISIT', 'PHONE', 'FAX', 'MAIL', 'CONFERENCE', 'OTHER'])
  category?: 'VISIT' | 'PHONE' | 'FAX' | 'MAIL' | 'CONFERENCE' | 'OTHER';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
