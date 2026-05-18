import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEventTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
