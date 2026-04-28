import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateSectionDto } from './create-section.dto';

export class UpdateSectionDto extends PartialType(CreateSectionDto) {
  @IsUUID()
  @IsOptional()
  articleId?: string;
}
