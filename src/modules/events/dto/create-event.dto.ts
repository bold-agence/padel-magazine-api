import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { parseTagsField } from './parse-tags-field.util';

const emptyStringToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  slug: string;

  @IsDateString()
  startAt: string;

  @IsOptional()
  @IsDateString()
  endAt?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  venue: string;

  @IsOptional()
  @IsUUID()
  tournamentId?: string | null;

  @IsOptional()
  @Transform(emptyStringToNull)
  @IsUUID()
  tournamentCategoryId?: string | null;

  @IsOptional()
  @IsString()
  descriptionHtml?: string | null;

  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;

  @IsOptional()
  @Transform(({ value }) => parseTagsField(value))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
