import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class FipRankingEntryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rank: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  playerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  countryCode?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  points: number;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  playerImageUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReplaceFipRankingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsDateString()
  rankingDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  sourceUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => FipRankingEntryDto)
  entries: FipRankingEntryDto[];
}

