import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { SectionType } from '../entities/section.entity';

export class SectionDto {
  @IsEnum(SectionType)
  type: SectionType;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  content?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  headingLevel?: number;

  @IsUrl()
  @MaxLength(2048)
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  imageCaption?: string;

  @IsString()
  @MaxLength(160)
  @IsOptional()
  quoteAuthor?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  spacerHeight?: number;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  infoBoxTitle?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;
}
