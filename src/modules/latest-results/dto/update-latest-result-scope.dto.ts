import { PartialType } from '@nestjs/mapped-types';
import { CreateLatestResultScopeDto } from './create-latest-result-scope.dto';

export class UpdateLatestResultScopeDto extends PartialType(
  CreateLatestResultScopeDto,
) {}
