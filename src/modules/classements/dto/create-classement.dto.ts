import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateClassementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug doit contenir des minuscules, chiffres et tirets uniquement',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  pointsNowLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  pointsPrevLabel?: string | null;
}
