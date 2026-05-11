import { PartialType } from '@nestjs/mapped-types';
import { CreateClassementDto } from './create-classement.dto';

export class UpdateClassementDto extends PartialType(CreateClassementDto) {}
