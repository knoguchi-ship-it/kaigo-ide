import { IsOptional, IsDateString } from 'class-validator';

export class ExportPdfQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
