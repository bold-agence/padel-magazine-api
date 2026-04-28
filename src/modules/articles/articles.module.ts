import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Section } from './entities/section.entity';
import { Tag } from './entities/tag.entity';
import { ArticleCategory } from './entities/article-category.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { ArticleCategoriesService } from './article-categories.service';
import { ArticleCategoriesController } from './article-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Section, Tag, ArticleCategory])],
  controllers: [
    TagsController,
    SectionsController,
    ArticleCategoriesController,
    ArticlesController,
  ],
  providers: [
    ArticlesService,
    TagsService,
    SectionsService,
    ArticleCategoriesService,
  ],
  exports: [
    ArticlesService,
    TagsService,
    SectionsService,
    ArticleCategoriesService,
  ],
})
export class ArticlesModule {}
