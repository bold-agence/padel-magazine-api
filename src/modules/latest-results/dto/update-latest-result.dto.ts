import { PartialType } from '@nestjs/mapped-types';
import { CreateLatestResultDto } from './create-latest-result.dto';

export class UpdateLatestResultDto extends PartialType(CreateLatestResultDto) {}

