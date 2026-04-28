import { PartialType } from '@nestjs/mapped-types';
import { IsBooleanString, IsOptional } from 'class-validator';
import { CreatePlayerDto } from './create-player.dto';

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {
  @IsOptional()
  @IsBooleanString()
  removeProfilePhoto?: string;
}
