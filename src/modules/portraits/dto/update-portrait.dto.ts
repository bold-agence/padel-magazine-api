import { PartialType } from '@nestjs/mapped-types';
import { CreatePortraitDto } from './create-portrait.dto';

export class UpdatePortraitDto extends PartialType(CreatePortraitDto) {}

