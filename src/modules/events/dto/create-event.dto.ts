import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

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
  @IsString()
  descriptionHtml?: string | null;

  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;
}
