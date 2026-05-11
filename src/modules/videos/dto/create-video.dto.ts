import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  youtubeLink: string;

  @IsUUID()
  videoTypeId: string;
}
