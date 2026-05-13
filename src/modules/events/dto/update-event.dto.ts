import { PartialType } from '@nestjs/mapped-types';
import { IsBooleanString, IsOptional } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsBooleanString()
  removeCoverImage?: string;
}
