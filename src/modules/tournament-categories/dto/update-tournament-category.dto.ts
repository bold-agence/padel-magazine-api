import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentCategoryDto } from './create-tournament-category.dto';

export class UpdateTournamentCategoryDto extends PartialType(
  CreateTournamentCategoryDto,
) {}
