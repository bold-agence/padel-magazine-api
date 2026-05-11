import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateVideoTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;
}
