import { IsIn, IsOptional, IsString } from 'class-validator';

/** Champs texte du multipart (retirer une image sans en envoyer une nouvelle) */
export class UpdateClassementPodiumDto {
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  removePodiumFirst?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  removePodiumSecond?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  removePodiumThird?: string;
}
