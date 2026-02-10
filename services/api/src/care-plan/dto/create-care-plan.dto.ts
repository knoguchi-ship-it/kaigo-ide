import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

class GoalDto {
  @IsEnum(['SHORT_TERM', 'LONG_TERM'])
  type!: 'SHORT_TERM' | 'LONG_TERM';

  @IsString()
  text!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateCarePlanDto {
  @IsDateString()
  createdDate!: string;

  @IsString()
  purpose!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoalDto)
  goals!: GoalDto[];
}
