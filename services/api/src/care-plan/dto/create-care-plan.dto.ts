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
import { GoalType } from '@prisma/client';

class GoalDto {
  @IsEnum(GoalType)
  type!: GoalType;

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
