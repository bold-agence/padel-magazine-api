import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePortraitDto {
  @IsUUID()
  @IsNotEmpty()
  playerId: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsInt()
  indice: number;

  @IsInt()
  pointNumber: number;

  @IsOptional()
  @IsString()
  signature?: string | null;

  @IsOptional()
  @IsUUID()
  articleId?: string | null;
}

