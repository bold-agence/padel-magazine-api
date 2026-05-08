import { PartialType } from '@nestjs/mapped-types';
import { CreatePortraitCategoryDto } from './create-portrait-category.dto';

export class UpdatePortraitCategoryDto extends PartialType(
  CreatePortraitCategoryDto,
) {}

