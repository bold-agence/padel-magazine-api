import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { Section } from './entities/section.entity';
import { Tag } from './entities/tag.entity';
import { ArticleCategory } from './entities/article-category.entity';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Section, Tag, ArticleCategory]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
