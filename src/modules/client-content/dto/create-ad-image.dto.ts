import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAdImageDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsIn(['header_main', 'home_leaderboard', 'sidebar_top', 'sidebar_bottom'])
  slot: 'header_main' | 'home_leaderboard' | 'sidebar_top' | 'sidebar_bottom';

  @IsString()
  @MaxLength(1000)
  imageUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  targetUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
