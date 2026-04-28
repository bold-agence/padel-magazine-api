import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateArticleCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  color: string;
}
