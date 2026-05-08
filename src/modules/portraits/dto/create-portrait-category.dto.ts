import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePortraitCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  libelle: string;
}

