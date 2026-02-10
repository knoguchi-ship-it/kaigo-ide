import {
  IsString,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class EvaluationDto {
  @IsString()
  goalId!: string;

  @IsString()
  goalText!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  comment!: string;
}

export class CreateMonitoringRecordDto {
  @IsString()
  carePlanId!: string;

  @IsDateString()
  recordDate!: string;

  @IsArray()
  @ArrayMinSize(1, { message: '少なくとも1つの目標評価が必要です' })
  @ValidateNested({ each: true })
  @Type(() => EvaluationDto)
  evaluations!: EvaluationDto[];

  @IsString()
  overallComment!: string;

  @IsString()
  professionalJudgment!: string;

  @IsString()
  nextAction!: string;
}
