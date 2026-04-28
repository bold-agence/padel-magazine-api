import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ArticleCategoriesService } from './article-categories.service';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';

@Controller('articles/categories')
export class ArticleCategoriesController {
  constructor(
    private readonly articleCategoriesService: ArticleCategoriesService,
  ) {}

  @Post()
  create(@Body() dto: CreateArticleCategoryDto) {
    return this.articleCategoriesService.create(dto);
  }

  @Get()
  findAll() {
    return this.articleCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateArticleCategoryDto) {
    return this.articleCategoriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleCategoriesService.remove(id);
  }
}
