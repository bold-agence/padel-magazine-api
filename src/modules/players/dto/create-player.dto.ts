import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nationality: string;

  @IsString()
  @IsOptional()
  profilePhoto?: string | null;
}
