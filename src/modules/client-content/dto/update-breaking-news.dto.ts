import { PartialType } from '@nestjs/mapped-types';
import { CreateBreakingNewsDto } from './create-breaking-news.dto';

export class UpdateBreakingNewsDto extends PartialType(CreateBreakingNewsDto) {}
