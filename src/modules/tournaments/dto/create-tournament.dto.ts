import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  label: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  colorCode: string;
}
