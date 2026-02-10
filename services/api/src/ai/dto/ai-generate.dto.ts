import {
  IsString,
  IsOptional,
  IsIn,
  ValidateNested,
  IsNumber,
  MaxLength,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class AiEvaluationContextDto {
  @IsString()
  @MaxLength(500)
  goalText!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

class AiContextDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  goalText?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @ArrayMaxSize(30)
  @Type(() => AiEvaluationContextDto)
  evaluations?: AiEvaluationContextDto[];
}

export class AiGenerateDto {
  @IsIn(['care_record', 'monitoring_comment', 'monitoring_overall', 'judgment'])
  type!: 'care_record' | 'monitoring_comment' | 'monitoring_overall' | 'judgment';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  keywords?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AiContextDto)
  context?: AiContextDto;
}
