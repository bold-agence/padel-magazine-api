import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleCategory } from './entities/article-category.entity';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';

@Injectable()
export class ArticleCategoriesService {
  constructor(
    @InjectRepository(ArticleCategory)
    private readonly categoriesRepo: Repository<ArticleCategory>,
  ) {}

  async create(dto: CreateArticleCategoryDto): Promise<ArticleCategory> {
    const slug = dto.slug.trim();
    const existing = await this.categoriesRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const category = this.categoriesRepo.create({
      name: dto.name.trim(),
      slug,
      color: dto.color.trim(),
    });

    return this.categoriesRepo.save(category);
  }

  async findAll(): Promise<ArticleCategory[]> {
    return this.categoriesRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ArticleCategory> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Article category not found');
    }
    return category;
  }

  async update(
    id: string,
    dto: UpdateArticleCategoryDto,
  ): Promise<ArticleCategory> {
    const category = await this.findOne(id);

    if (dto.slug !== undefined) {
      const slug = dto.slug.trim();
      if (slug !== category.slug) {
        const existing = await this.categoriesRepo.findOne({ where: { slug } });
        if (existing) {
          throw new ConflictException('Category slug already exists');
        }
      }
      category.slug = slug;
    }

    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.color !== undefined) category.color = dto.color.trim();

    return this.categoriesRepo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepo.softRemove(category);
  }
}
