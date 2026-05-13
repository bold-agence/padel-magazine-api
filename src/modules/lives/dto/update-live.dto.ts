import { PartialType } from '@nestjs/mapped-types';
import { IsBooleanString, IsOptional } from 'class-validator';
import { CreateLiveDto } from './create-live.dto';

export class UpdateLiveDto extends PartialType(CreateLiveDto) {
  @IsOptional()
  @IsBooleanString()
  removeCoverImage?: string;
}
