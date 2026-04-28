import { IsUUID } from 'class-validator';
import { SectionDto } from './section.dto';

export class CreateSectionDto extends SectionDto {
  @IsUUID()
  articleId: string;
}
