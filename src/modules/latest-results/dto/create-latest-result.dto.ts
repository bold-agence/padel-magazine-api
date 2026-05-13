import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LATEST_RESULT_CATEGORIES } from '../latest-result-category';
import type { LatestResultCategory } from '../latest-result-category';

export class CreateLatestResultDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  tournamentName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string | null;

  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsDateString()
  resultDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  round: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  winners: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  score: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  losers: string;

  @IsOptional()
  @IsIn(LATEST_RESULT_CATEGORIES)
  category?: LatestResultCategory;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
