import { PartialType } from '@nestjs/mapped-types';
import { CreateAdImageDto } from './create-ad-image.dto';

export class UpdateAdImageDto extends PartialType(CreateAdImageDto) {}
