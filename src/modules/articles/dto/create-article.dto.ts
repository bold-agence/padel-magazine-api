import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsBoolean,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { SectionDto } from './section.dto';

export class CreateArticleDto {
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  author: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  readingTime: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  bannerImage?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  @ArrayMaxSize(200)
  @IsOptional()
  sections?: SectionDto[];
}
