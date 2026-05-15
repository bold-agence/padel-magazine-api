import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const emptyStringToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export class CreateTournamentCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  tournamentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  label: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  slug: string;

  @IsOptional()
  @Transform(emptyStringToNull)
  @IsString()
  description?: string | null;
}
