import {
  IsString,
  IsDateString,
  IsArray,
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
